import { NextResponse } from "next/server";
import { instagramData } from "@/data/instagram";

export async function GET() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!token || token.includes("placeholder") || token === "") {
    // Return static fallback if no token is configured
    return NextResponse.json({ success: true, reels: instagramData, isMocked: true });
  }

  try {
    const response = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&access_token=${token}`,
      { next: { revalidate: 3600 } } // Cache results for 1 hour to optimize performance
    );

    if (!response.ok) {
      const errData = await response.json();
      console.warn("Instagram API responded with error, falling back to static data:", errData);
      return NextResponse.json({ success: true, reels: instagramData, isMocked: true });
    }

    const resData = await response.json();

    if (!resData.data || !Array.isArray(resData.data)) {
      return NextResponse.json({ success: true, reels: instagramData, isMocked: true });
    }

    // Filter to only display video media (which includes Reels)
    const mapped = resData.data
      .filter((item: any) => item.media_type === "VIDEO")
      .slice(0, 4)
      .map((item: any) => {
        let title = "Exclusive Atelier Design";
        if (item.caption) {
          const firstLine = item.caption.split("\n")[0].trim();
          // Clean hashtags and tags for cleaner typography
          title = firstLine.replace(/[#@]\S+/g, "").replace(/\s+/g, " ").trim();
          if (title.length > 25) {
            title = title.substring(0, 22) + "...";
          }
        }
        return {
          id: item.id,
          imageUrl: item.thumbnail_url || item.media_url,
          videoUrl: item.media_url,
          title: title || "New Design Release",
          collectionLink: item.permalink,
        };
      });

    // If no videos/reels are returned, fallback to mock data
    if (mapped.length === 0) {
      return NextResponse.json({ success: true, reels: instagramData, isMocked: true });
    }

    return NextResponse.json({ success: true, reels: mapped, isMocked: false });
  } catch (error: any) {
    console.error("Instagram Reels Fetch Error:", error);
    return NextResponse.json({ success: true, reels: instagramData, isMocked: true });
  }
}
