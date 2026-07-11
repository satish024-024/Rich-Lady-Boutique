import { NextResponse } from "next/server";
import { supabaseServer } from "@/utils/supabaseServer";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 1. Ensure the 'product-images' bucket exists (self-healing)
    const bucketName = "product-images";
    try {
      const { data: buckets, error: listError } = await supabaseServer.storage.listBuckets();
      if (listError) throw listError;

      const bucketExists = buckets?.some((b) => b.name === bucketName);
      if (!bucketExists) {
        console.log(`Bucket '${bucketName}' does not exist. Creating...`);
        const { error: createError } = await supabaseServer.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 5242880, // 5MB limit
        });
        if (createError) throw createError;
      }
    } catch (bucketErr: any) {
      console.error("Error checking/creating storage bucket:", bucketErr.message);
      return NextResponse.json({ error: "Storage initialization failed: " + bucketErr.message }, { status: 500 });
    }

    // 2. Generate unique filename and upload buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileExt = file.name.split(".").pop();
    const uniqueId = crypto.randomUUID();
    const fileName = `${uniqueId}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabaseServer.storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType: file.type,
        duplex: "half",
      });

    if (uploadError) {
      console.error("Supabase storage upload error:", uploadError.message);
      return NextResponse.json({ error: "Upload failed: " + uploadError.message }, { status: 500 });
    }

    // 3. Get Public URL
    const { data: urlData } = supabaseServer.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
    });
  } catch (error: any) {
    console.error("Exception in upload-image API:", error);
    return NextResponse.json({ error: error.message || "Failed to process upload" }, { status: 500 });
  }
}
