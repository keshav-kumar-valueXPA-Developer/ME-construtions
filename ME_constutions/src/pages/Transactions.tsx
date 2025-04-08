import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

// Available tables
const TABLES = {
  cost_schedule_variables: "Cost_schedule", 
  productivity_variables: "Productivity",
  labour_management_variables: "Labour Management",
  risk_management_variables: "Risk Management",
  supply_chain_variables: "Supply Chain",
};

export default function Transactions() {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch data when table is selected
  useEffect(() => {
    if (!selectedTable) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.from(selectedTable).select("*");
      console.log(data);

      if (error) {
        console.error("Error fetching data:", error.message);
        setError("Failed to fetch data.");
        setLoading(false);
        return;
      }

      // If no data is found
      if (!data || data.length === 0) {
        setTableData([]);
        setColumns([]);
        setLoading(false);
        return;
      }

      // Dynamically generate columns based on table structure
      const columnHelper = createColumnHelper<any>();
      const generatedColumns = Object.keys(data[0]).map((key) =>
        columnHelper.accessor(key, {
          header: key.replace(/_/g, " ").toUpperCase(),
          cell: (info) => info.getValue(),
        })
      );

      setColumns(generatedColumns);
      setTableData(data);
      setLoading(false);
    };

    fetchData();
  }, [selectedTable]);

  // Set selected table from dropdown
  const handleTableChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTable(e.target.value);
  };

  // Table instance
  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-gray-900">View Data</h1>
      <p className="text-gray-600">Select a table to view its data.</p>

      {/* Dropdown for selecting table */}
      <div className="mt-4">
        <label className="block text-gray-700 font-medium">Select Table:</label>
        <select
          className="mt-1 p-2 border rounded w-full"
          onChange={handleTableChange}
        >
          <option value="">-- Select a Table --</option>
          {Object.entries(TABLES).map(([table, label]) => (
            <option key={table} value={table}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Loading State */}
      {loading && <p className="mt-4 text-blue-600">Loading data...</p>}

      {/* Error State */}
      {error && <p className="mt-4 text-red-600">{error}</p>}

      {/* Data Table */}
      {tableData.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border border-gray-300">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* No Data Found */}
      {!loading && tableData.length === 0 && selectedTable && (
        <p className="mt-4 text-gray-500">No data available in {TABLES[selectedTable]}.</p>
      )}
    </div>
  );
}
