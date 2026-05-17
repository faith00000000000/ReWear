import { notFound } from "next/navigation";
import { getProductById, products } from "../products";
import ProductDetailClient from "./product-detail-client";

export function generateStaticParams() {
  return products.map((product) => ({
    id: product.id.toString(),
  }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  const recommendations = products
    .filter((item) => item.id !== product.id)
    .slice(0, 3);

  return (
    <ProductDetailClient
      product={product}
      recommendations={recommendations}
    />
  );
}
