import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: "dkrjw3kci",
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: "No se subió ningún archivo" },
        { status: 400 }
      );
    }

    console.log("📤 Procesando archivo:", file.name, "tipo:", file.type);

    // Convertir el archivo a base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const dataURI = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Subir a Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(dataURI, {
        folder: "icons"
      }, (error, result) => {
        if (error) {
          console.error("Error en Cloudinary:", error);
          reject(error);
        } else {
          console.log("✅ Subida exitosa a Cloudinary:", result.secure_url);
          resolve(result);
        }
      });
    });

    // Devuelve tanto path como url para compatibilidad
    return NextResponse.json({
      success: true,
      path: result.secure_url,
      url: result.secure_url
    });

  } catch (error) {
    console.error("🔴 Error en API upload:", error);
    return NextResponse.json(
      { success: false, error: "Error al subir la imagen" },
      { status: 500 }
    );
  }
}
