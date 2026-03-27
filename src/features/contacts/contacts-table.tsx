"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";

type ContactRow = {
  id: string;
  fullName: string;
  email: string;
  companyName: string;
  industry: string;
  regionProfile: string;
  lawfulBasis: string;
  outreachStatus: string;
};

const columns: ColumnDef<ContactRow>[] = [
  {
    accessorKey: "fullName",
    header: "Contact",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">
          <Link className="hover:underline" href={`/dashboard/contacts/${row.original.id}`}>
            {row.original.fullName || "Unnamed contact"}
          </Link>
        </div>
        <div className="text-xs text-muted-foreground">{row.original.email}</div>
      </div>
    )
  },
  {
    accessorKey: "companyName",
    header: "Company"
  },
  {
    accessorKey: "industry",
    header: "Industry"
  },
  {
    accessorKey: "regionProfile",
    header: "Region",
    cell: ({ row }) => <StatusBadge value={row.original.regionProfile} />
  },
  {
    accessorKey: "lawfulBasis",
    header: "Lawful basis",
    cell: ({ row }) => <StatusBadge value={row.original.lawfulBasis} />
  },
  {
    accessorKey: "outreachStatus",
    header: "Outreach status",
    cell: ({ row }) => <StatusBadge value={row.original.outreachStatus} />
  }
];

export function ContactsTable({ data }: { data: ContactRow[] }) {
  return <DataTable columns={columns} data={data} />;
}
