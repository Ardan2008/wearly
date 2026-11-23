
"use client";

import { useRef, useState } from "react";
import { ImagePlus, Star, Trash2, LoaderCircle } from "lucide-react";
import Image from "next/image";

export type ProductImageValue = {
  imageUrl: string;
  isPrimary: boolean;
};

type ProductImageUploaderProps = {
  value: ProductImageValue[];
  onChange: (images: ProductImageValue[]) => void;
  maxImages?: number;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export function ProductImageUploader({
  value,
  onChange,
  maxImages = 5,
}: ProductImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  async function uploadImage(file: File): Promise<string> {
    const signatureResponse = await fetch(
      "/api/cloudinary/signature",
      { method: "GET" }
    );

    const signatureData = await signatureResponse.json();

    if (!signatureResponse.ok) {
      throw new Error(
        signatureData.message || "Gagal mendapatkan upload signature."
      );
    }

    const formData = new FormData();

    formData.append("file", file);
    formData.append("api_key", signatureData.apiKey);
    formData.append("timestamp", String(signatureData.timestamp));
    formData.append("folder", signatureData.folder);
    formData.append("allowed_formats", signatureData.allowedFormats);
    formData.append("signature", signatureData.signature);

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const uploadData = await uploadResponse.json();

    if (!uploadResponse.ok) {
      throw new Error(
        uploadData.error?.message || "Gagal mengunggah gambar."
      );
    }

    return uploadData.secure_url;
  }

  async function handleFiles(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(event.target.files ?? []);

    setError("");

    if (!files.length) return;

    const remainingSlots = maxImages - value.length;

    if (remainingSlots <= 0) {
      setError(`Maksimal ${maxImages} gambar produk.`);
      event.target.value = "";
      return;
    }

    if (files.length > remainingSlots) {
      setError(`Kamu hanya dapat menambahkan ${remainingSlots} gambar lagi.`);
      event.target.value = "";
      return;
    }

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("Format gambar harus JPG, PNG, atau WebP.");
        event.target.value = "";
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError("Ukuran setiap gambar maksimal 5 MB.");
        event.target.value = "";
        return;
      }
    }

    setIsUploading(true);

    try {
      const uploadedImages: ProductImageValue[] = [];

      for (const file of files) {
        const imageUrl = await uploadImage(file);

        uploadedImages.push({
          imageUrl,
          isPrimary: value.length === 0 && uploadedImages.length === 0,
        });
      }

      onChange([...value, ...uploadedImages]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengunggah gambar."
      );
    } finally {
      setIsUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function setPrimary(index: number) {
    onChange(
      value.map((image, i) => ({
        ...image,
        isPrimary: i === index,
      }))
    );
  }

  function removeImage(index: number) {
    const updatedImages = value.filter((_, i) => i !== index);

    if (value[index]?.isPrimary && updatedImages.length > 0) {
      updatedImages[0].isPrimary = true;
    }

    onChange(updatedImages);
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-neutral-900">
          Gambar Produk
        </h3>

        <p className="mt-1 text-xs text-neutral-500">
          JPG, PNG, atau WebP. Maksimal 5 MB per gambar.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {value.map((image, index) => (
          <div
            key={image.imageUrl}
            className="group relative aspect-square overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50"
          >
            <Image
              src={image.imageUrl}
              alt={`Gambar produk ${index + 1}`}
              width={400}
              height={400}
              className="h-full w-full object-cover"
            />

            {image.isPrimary && (
              <span className="absolute left-2 top-2 rounded-md bg-black px-2 py-1 text-[10px] font-medium text-white">
                Utama
              </span>
            )}

            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/60 p-2 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
              <button
                type="button"
                onClick={() => setPrimary(index)}
                title="Jadikan gambar utama"
                className="rounded-md p-1.5 text-white hover:bg-white/20"
              >
                <Star
                  className="h-4 w-4"
                  fill={image.isPrimary ? "currentColor" : "none"}
                />
              </button>

              <button
                type="button"
                onClick={() => removeImage(index)}
                title="Hapus gambar"
                className="rounded-md p-1.5 text-white hover:bg-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {value.length < maxImages && (
          <button
            type="button"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 bg-white text-neutral-500 transition hover:border-neutral-500 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploading ? (
              <LoaderCircle className="h-6 w-6 animate-spin" />
            ) : (
              <ImagePlus className="h-6 w-6" />
            )}

            <span className="text-xs font-medium">
              {isUploading ? "Mengunggah..." : "Tambah Gambar"}
            </span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        onChange={handleFiles}
      />

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <p className="text-xs text-neutral-500">
        {value.length} dari {maxImages} gambar. Klik ikon bintang untuk
        menentukan gambar utama.
      </p>
    </div>
  );
}
