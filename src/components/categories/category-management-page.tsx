import { prisma } from "@/lib/prisma";

import { CategoryList } from "./category-list";

type CategoryManagementPageProps = {
  basePath: "/owner/categories" | "/admin/categories";
};

export async function CategoryManagementPage({
  basePath,
}: CategoryManagementPageProps) {
  const categories = await prisma.category.findMany({
    orderBy: [
      { parentId: "asc" },
      { sortOrder: "asc" },
      { name: "asc" },
    ],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      isActive: true,
      sortOrder: true,
      parent: {
        select: { name: true },
      },
      _count: {
        select: {
          products: true,
          children: true,
        },
      },
    },
  });

  const formattedCategories = categories.map((category) => ({
    id: category.id.toString(),
    name: category.name,
    slug: category.slug,
    description: category.description,
    isActive: category.isActive,
    sortOrder: category.sortOrder,
    parentName: category.parent?.name ?? null,
    productCount: category._count.products,
    childCount: category._count.children,
  }));

  return (
    <CategoryList
      categories={formattedCategories}
      basePath={basePath}
      canDelete={basePath === "/owner/categories"}
    />
  );
}