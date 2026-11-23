
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Trash2,
  X,
  Save,
  ArrowLeft,
} from "lucide-react";

import {
  createProductAction,
  createProductReferenceAction,
} from "./product-actions";

import {
  ProductImageUploader,
  type ProductImageValue,
} from "./product-image-uploader";

/* Types */

type SelectOption = {
  id: string;
  name: string;
};

type ColorOption = SelectOption & {
  hexCode: string | null;
};

type ProductCreateFormProps = {
  basePath: string;
  categories: SelectOption[];
  audiences: SelectOption[];
  sizes: SelectOption[];
  colors: ColorOption[];
};

type ReferenceType = "category" | "audience" | "size" | "color";

/* Validation Schema */

/**
 * Mengubah angka menjadi format Rupiah.
 * Contoh: 150000 menjadi 150.000.
 */
function formatRupiah(value: string | number) {
  const numericValue = String(value).replace(/\D/g, "");

  if (!numericValue) return "";

  return new Intl.NumberFormat("id-ID").format(
    Number(numericValue)
  );
}

const productSchema = z.object({
  name: z.string().trim().min(1, "Nama produk wajib diisi.").max(150),
  categoryId: z.string().min(1, "Kategori wajib dipilih."),
  brand: z.string().trim().max(100, "Maksimal 100 karakter."),
  description: z.string().trim(),
  audiences: z.array(z.string()).min(1, "Pilih minimal satu audiens."),
  images: z
    .array(
      z.object({
        imageUrl: z.string().url(),
        isPrimary: z.boolean(),
      })
    )
    .min(1, "Tambahkan minimal satu gambar produk.")
    .refine(
      (images) => images.filter((image) => image.isPrimary).length === 1,
      "Tentukan tepat satu gambar utama."
    ),
  variants: z
    .array(
      z.object({
        sizeId: z.string().min(1, "Ukuran wajib dipilih."),
        colorId: z.string().min(1, "Warna wajib dipilih."),
        sku: z.string().trim().min(1, "SKU wajib diisi.").max(100),
        price: z
          .string()
          .regex(/^\d+$/, "Masukkan harga yang valid.")
          .refine(
            (value) => Number(value) > 0,
            "Harga harus lebih dari 0."
          )
          .refine(
            (value) => Number(value) <= 9999999999,
            "Harga melebihi batas maksimum."
          ),
        stockQuantity: z
          .string()
          .regex(/^\d+$/, "Stok harus berupa bilangan bulat.")
          .refine(
            (value) => Number(value) <= 4294967295,
            "Stok melebihi batas maksimum."
          ),
      })
    )
    .min(1, "Tambahkan minimal satu varian."),
  status: z.enum(["DRAFT", "ACTIVE"]),
});

type ProductFormValues = z.infer<typeof productSchema>;

/* Main Component */

export function ProductCreateForm(props: ProductCreateFormProps) {
  const { basePath } = props;

  /* Master Data */

  const [categories, setCategories] = useState(props.categories);
  const [audiences, setAudiences] = useState(props.audiences);
  const [sizes, setSizes] = useState(props.sizes);
  const [colors, setColors] = useState(props.colors);

  /* Router and Submit State */

  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState(false);

  /* Reference Dialog State */

  const [referenceType, setReferenceType] =
    useState<ReferenceType | null>(null);

  const [referenceName, setReferenceName] = useState("");
  const [referenceHexCode, setReferenceHexCode] = useState("#000000");
  const [referenceError, setReferenceError] = useState("");
  const [isCreatingReference, setIsCreatingReference] = useState(false);

  /* React Hook Form */

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      categoryId: "",
      brand: "",
      description: "",
      audiences: [],
      images: [],
      variants: [
        {
          sizeId: "",
          colorId: "",
          sku: "",
          price: "",
          stockQuantity: "0",
        },
      ],
      status: "DRAFT",
    },
  });

  const {
    fields: variantFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "variants",
  });

  /* Watch Form Values */

  const selectedAudiences =
    useWatch({
      control,
      name: "audiences",
    }) ?? [];

  const images =
    useWatch({
      control,
      name: "images",
    }) ?? [];

  const variants =
    useWatch({
      control,
      name: "variants",
    }) ?? [];

  /* Open Reference Dialog */

  function openReferenceDialog(type: ReferenceType) {
    setReferenceType(type);
    setReferenceName("");
    setReferenceHexCode("#000000");
    setReferenceError("");
  }

  /* Create Reference Data */

  async function handleCreateReference() {
    if (!referenceType) return;

    if (!referenceName.trim()) {
      setReferenceError("Nama wajib diisi.");
      return;
    }

    if (
      referenceType === "color" &&
      !/^#[0-9A-Fa-f]{6}$/.test(referenceHexCode)
    ) {
      setReferenceError("Format HEX harus seperti #000000.");
      return;
    }

    setReferenceError("");
    setIsCreatingReference(true);

    try {
      const result = await createProductReferenceAction({
        type: referenceType,
        name: referenceName.trim(),
        ...(referenceType === "color"
          ? { hexCode: referenceHexCode }
          : {}),
      });

      if (!result.success || !result.item) {
        setReferenceError(result.message);
        return;
      }

      const item = result.item;

      switch (referenceType) {
        case "category": {
          setCategories((current) => [
            ...current,
            { id: item.id, name: item.name },
          ]);

          setValue("categoryId", item.id, {
            shouldValidate: true,
            shouldDirty: true,
          });

          break;
        }

        case "audience": {
          setAudiences((current) => [
            ...current,
            { id: item.id, name: item.name },
          ]);

          setValue(
            "audiences",
            [...selectedAudiences, item.id],
            {
              shouldValidate: true,
              shouldDirty: true,
            }
          );

          break;
        }

        case "size": {
          setSizes((current) => [
            ...current,
            { id: item.id, name: item.name },
          ]);

          if (!getValues("variants.0.sizeId")) {
            setValue("variants.0.sizeId", item.id, {
              shouldValidate: true,
              shouldDirty: true,
            });
          }

          break;
        }

        case "color": {
          setColors((current) => [
            ...current,
            {
              id: item.id,
              name: item.name,
              hexCode: item.hexCode ?? null,
            },
          ]);

          if (!getValues("variants.0.colorId")) {
            setValue("variants.0.colorId", item.id, {
              shouldValidate: true,
              shouldDirty: true,
            });
          }

          break;
        }
      }

      setReferenceType(null);
    } catch {
      setReferenceError("Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsCreatingReference(false);
    }
  }

  /* Toggle Audience */

  function toggleAudience(audienceId: string) {
    const current = selectedAudiences;

    const updated = current.includes(audienceId)
      ? current.filter((id) => id !== audienceId)
      : [...current, audienceId];

    setValue("audiences", updated, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }

  /* Handle Product Images */

  function handleImagesChange(nextImages: ProductImageValue[]) {
    setValue("images", nextImages, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }

  /* Submit Product */

  async function onSubmit(values: ProductFormValues) {
    setSubmitMessage("");
    setSubmitError(false);

    startTransition(async () => {
      try {
        const result = await createProductAction(values);

        if (!result.success) {
          setSubmitError(true);
          setSubmitMessage(result.message);
          return;
        }

        setSubmitMessage(result.message);

        router.push(basePath);
        router.refresh();
      } catch {
        setSubmitError(true);
        setSubmitMessage(
          "Terjadi kesalahan saat menyimpan produk. Silakan coba kembali."
        );
      }
    });
  }

  /* Render */

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informasi Produk */}

        <section className="space-y-5 rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
          <div>
            <h2 className="font-semibold text-neutral-900">
              Informasi Produk
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Masukkan informasi dasar produk.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">
              Nama Produk <span className="text-red-500">*</span>
            </label>

            <input
              {...register("name")}
              placeholder="Contoh: Oversized T-Shirt"
              maxLength={150}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-500"
            />

            {errors.name && (
              <p className="text-xs text-red-600">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Kategori */}

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm font-medium text-neutral-700">
                Kategori <span className="text-red-500">*</span>
              </label>

              <button
                type="button"
                onClick={() => openReferenceDialog("category")}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-700 hover:text-black"
              >
                <Plus className="size-3.5" />
                Tambah Kategori
              </button>
            </div>

            <select
              {...register("categoryId")}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-neutral-500"
            >
              <option value="">Pilih kategori</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {errors.categoryId && (
              <p className="text-xs text-red-600">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          {/* Deskripsi */}

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">
              Deskripsi
            </label>

            <textarea
              {...register("description")}
              rows={4}
              placeholder="Jelaskan detail produk..."
              className="w-full resize-y rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-500"
            />
          </div>

          {/* Target Audiens */}

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm font-medium text-neutral-700">
                Target Audiens <span className="text-red-500">*</span>
              </label>

              <button
                type="button"
                onClick={() => openReferenceDialog("audience")}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-700 hover:text-black"
              >
                <Plus className="size-3.5" />
                Tambah Audiens
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              {audiences.map((audience) => (
                <label
                  key={audience.id}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedAudiences.includes(audience.id)}
                    onChange={() => toggleAudience(audience.id)}
                    className="accent-black"
                  />

                  {audience.name}
                </label>
              ))}
            </div>

            {errors.audiences && (
              <p className="text-xs text-red-600">
                {errors.audiences.message}
              </p>
            )}
          </div>
        </section>

        {/* Gambar Produk */}

        <section className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
          <ProductImageUploader
            value={images}
            onChange={handleImagesChange}
            maxImages={5}
          />

          {errors.images && (
            <p className="mt-3 text-xs text-red-600">
              {errors.images.message}
            </p>
          )}
        </section>

        {/* Varian Produk */}

        <section className="space-y-5 rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-neutral-900">
                Varian Produk
              </h2>

              <p className="mt-1 text-sm text-neutral-500">
                Atur ukuran, warna, SKU, harga, dan stok.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                append({
                  sizeId: "",
                  colorId: "",
                  sku: "",
                  price: "",
                  stockQuantity: "0",
                })
              }
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium hover:bg-neutral-50"
            >
              <Plus className="size-4" />
              Tambah Varian
            </button>
          </div>

          <div className="space-y-4">
            {variantFields.map((field, index) => (
              <div
                key={field.id}
                className="space-y-4 rounded-lg border border-neutral-200 p-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-neutral-800">
                    Varian {index + 1}
                  </h3>

                  {variantFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      title="Hapus varian"
                      aria-label={`Hapus varian ${index + 1}`}
                      className="rounded-md p-2 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Ukuran */}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-sm text-neutral-600">
                        Ukuran *
                      </label>

                      <button
                        type="button"
                        onClick={() => openReferenceDialog("size")}
                        className="inline-flex items-center gap-1 text-xs font-medium text-neutral-700 hover:text-black"
                      >
                        <Plus className="size-3.5" />
                        Tambah
                      </button>
                    </div>

                    <select
                      {...register(`variants.${index}.sizeId`)}
                      className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm"
                    >
                      <option value="">Pilih ukuran</option>

                      {sizes.map((size) => (
                        <option key={size.id} value={size.id}>
                          {size.name}
                        </option>
                      ))}
                    </select>

                    {errors.variants?.[index]?.sizeId && (
                      <p className="text-xs text-red-600">
                        {errors.variants[index].sizeId.message}
                      </p>
                    )}
                  </div>

                  {/* Warna */}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-sm text-neutral-600">
                        Warna *
                      </label>

                      <button
                        type="button"
                        onClick={() => openReferenceDialog("color")}
                        className="inline-flex items-center gap-1 text-xs font-medium text-neutral-700 hover:text-black"
                      >
                        <Plus className="size-3.5" />
                        Tambah
                      </button>
                    </div>

                    <select
                      {...register(`variants.${index}.colorId`)}
                      className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm"
                    >
                      <option value="">Pilih warna</option>

                      {colors.map((color) => (
                        <option key={color.id} value={color.id}>
                          {color.name}
                        </option>
                      ))}
                    </select>

                    {errors.variants?.[index]?.colorId && (
                      <p className="text-xs text-red-600">
                        {errors.variants[index].colorId.message}
                      </p>
                    )}
                  </div>

                  {/* SKU */}

                  <div className="space-y-2">
                    <label className="text-sm text-neutral-600">
                      SKU *
                    </label>

                    <input
                      {...register(`variants.${index}.sku`)}
                      placeholder="Contoh: WRY-TSH-BLK-M"
                      maxLength={100}
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
                    />

                    {errors.variants?.[index]?.sku && (
                      <p className="text-xs text-red-600">
                        {errors.variants[index].sku.message}
                      </p>
                    )}
                  </div>

                  {/* Harga */}

                  <div className="space-y-2">
                    <label className="text-sm text-neutral-600">
                      Harga (Rp) *
                    </label>

                    <div className="flex overflow-hidden rounded-lg border border-neutral-200 focus-within:border-neutral-500">
                      <span className="flex items-center border-r border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-500">
                        Rp
                      </span>

                      <input
                        {...register(`variants.${index}.price`)}
                        type="text"
                        inputMode="numeric"
                        value={formatRupiah(variants[index]?.price ?? "")}
                        onChange={(event) => {
                          const value = event.target.value.replace(
                            /\D/g,
                            ""
                          );

                          setValue(`variants.${index}.price`, value, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                        }}
                        placeholder="150.000"
                        className="w-full min-w-0 px-3 py-2.5 text-sm outline-none"
                      />
                    </div>

                    {errors.variants?.[index]?.price && (
                      <p className="text-xs text-red-600">
                        {errors.variants[index].price.message}
                      </p>
                    )}
                  </div>

                  {/* Stok */}

                  <div className="space-y-2">
                    <label className="text-sm text-neutral-600">
                      Stok *
                    </label>

                    <input
                      {...register(`variants.${index}.stockQuantity`)}
                      type="number"
                      min="0"
                      step="1"
                      placeholder="0"
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm"
                    />

                    {errors.variants?.[index]?.stockQuantity && (
                      <p className="text-xs text-red-600">
                        {errors.variants[index].stockQuantity.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {errors.variants?.root && (
            <p className="text-xs text-red-600">
              {errors.variants.root.message}
            </p>
          )}
        </section>

        {/* Status Produk */}

        <section className="space-y-4 rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
          <div>
            <h2 className="font-semibold text-neutral-900">
              Status Produk
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              Tentukan status awal produk.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-neutral-200 p-4">
              <input
                {...register("status")}
                type="radio"
                value="DRAFT"
                className="mt-1 accent-black"
              />

              <div>
                <p className="text-sm font-medium">Draft</p>
                <p className="mt-1 text-xs text-neutral-500">
                  Produk belum ditampilkan kepada pelanggan.
                </p>
              </div>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-neutral-200 p-4">
              <input
                {...register("status")}
                type="radio"
                value="ACTIVE"
                className="mt-1 accent-black"
              />

              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="mt-1 text-xs text-neutral-500">
                  Produk siap ditampilkan di katalog.
                </p>
              </div>
            </label>
          </div>
        </section>

        {/* Form Actions */}

        <div className="flex flex-wrap items-center justify-end gap-3">
          <a
            href={basePath}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            <ArrowLeft className="size-4" />
            Batal
          </a>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="size-4" />
            {isPending ? "Menyimpan..." : "Simpan Produk"}
          </button>
        </div>

        {/* Pesan Hasil Submit */}

        {submitMessage && (
          <p
            role="status"
            className={`rounded-lg border p-3 text-sm ${
              submitError
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-green-200 bg-green-50 text-green-800"
            }`}
          >
            {submitMessage}
          </p>
        )}
      </form>

      {/* Dialog Tambah Master Data */}

      {referenceType && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !isCreatingReference
            ) {
              setReferenceType(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reference-dialog-title"
            className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-xl"
          >
            <div className="mb-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2
                    id="reference-dialog-title"
                    className="text-lg font-semibold text-neutral-900"
                  >
                    Tambah{" "}
                    {
                      {
                        category: "Kategori",
                        audience: "Audiens",
                        size: "Ukuran",
                        color: "Warna",
                      }[referenceType]
                    }
                  </h2>

                  <p className="mt-1 text-sm text-neutral-500">
                    Masukkan data baru untuk pilihan produk WEARLY.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isCreatingReference}
                  onClick={() => setReferenceType(null)}
                  className="rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-100 disabled:opacity-50"
                  aria-label="Tutup dialog"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="reference-name"
                  className="text-sm font-medium text-neutral-700"
                >
                  Nama{" "}
                  {
                    {
                      category: "Kategori",
                      audience: "Audiens",
                      size: "Ukuran",
                      color: "Warna",
                    }[referenceType]
                  }
                </label>

                <input
                  id="reference-name"
                  autoFocus
                  value={referenceName}
                  onChange={(event) =>
                    setReferenceName(event.target.value)
                  }
                  placeholder={
                    referenceType === "category"
                      ? "Contoh: T-Shirt"
                      : referenceType === "audience"
                        ? "Contoh: Male"
                        : referenceType === "size"
                          ? "Contoh: M"
                          : "Contoh: Black"
                  }
                  maxLength={
                    referenceType === "category"
                      ? 100
                      : referenceType === "audience"
                        ? 50
                        : referenceType === "size"
                          ? 30
                          : 50
                  }
                  disabled={isCreatingReference}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-500 disabled:bg-neutral-50"
                />
              </div>

              {referenceType === "color" && (
                <div className="space-y-2">
                  <label
                    htmlFor="reference-hex"
                    className="text-sm font-medium text-neutral-700"
                  >
                    Kode Warna (HEX)
                  </label>

                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={
                        /^#[0-9A-Fa-f]{6}$/.test(referenceHexCode)
                          ? referenceHexCode
                          : "#000000"
                      }
                      onChange={(event) =>
                        setReferenceHexCode(event.target.value)
                      }
                      disabled={isCreatingReference}
                      className="h-10 w-14 cursor-pointer rounded border border-neutral-200 disabled:cursor-not-allowed"
                    />

                    <input
                      id="reference-hex"
                      value={referenceHexCode}
                      onChange={(event) =>
                        setReferenceHexCode(event.target.value)
                      }
                      maxLength={7}
                      disabled={isCreatingReference}
                      className="flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm uppercase outline-none focus:border-neutral-500 disabled:bg-neutral-50"
                    />
                  </div>

                  {referenceHexCode &&
                    !/^#[0-9A-Fa-f]{6}$/.test(referenceHexCode) && (
                      <p className="text-xs text-red-600">
                        Format HEX harus seperti #000000.
                      </p>
                    )}
                </div>
              )}

              {referenceError && (
                <p role="alert" className="text-sm text-red-600">
                  {referenceError}
                </p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={isCreatingReference}
                onClick={() => setReferenceType(null)}
                className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={
                  isCreatingReference ||
                  !referenceName.trim() ||
                  (referenceType === "color" &&
                    !/^#[0-9A-Fa-f]{6}$/.test(referenceHexCode))
                }
                onClick={handleCreateReference}
                className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCreatingReference ? (
                  "Menyimpan..."
                ) : (
                  <>
                    <Save className="size-4" />
                    Simpan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
