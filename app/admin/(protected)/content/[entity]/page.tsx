"use client";

import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { ENTITY_CONFIGS } from "../entity-configs";
import { EntityTable } from "../entity-table";

export default function EntityPage() {
  const params = useParams<{ entity: string }>();
  const config = ENTITY_CONFIGS[params.entity];

  if (!config) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <EntityTable config={config} />
    </div>
  );
}
