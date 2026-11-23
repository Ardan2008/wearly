
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAnyRole } from "@/lib/auth-guard";
import { CategoryEditPage } from "@/components/categories/category-edit-page";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditCategoryPage({
  params,
}: PageProps) {
  await requireAnyRole(["ADMIN"]);

  const { id } = await params;

  if (!/^[1-9]\d*$/.test(id)) {
    notFound();
  }

  const category = await prisma.category.findUnique({
    where: { id: BigInt(id) },
    select: {
      id: true,
      name: true,
    },
  });

  if (!category) {
    notFound();
  }

  return (
    <CategoryEditPage
      basePath="/admin/categories"
      categoryId={category.id.toString()}
      categoryName={category.name}
    />
  );
}
