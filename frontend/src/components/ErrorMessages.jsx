import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const coerceArr = (value) => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

export default function ErrorMessages({ error, fieldErrors }) {
  if (!error && (!fieldErrors || Object.keys(fieldErrors).length === 0)) {
    return null; // Nothing to show
  }

  return (
    <Card className="border-destructive bg-red-50/50">
      <CardContent className="pt-6">
        {/* General error */}
        {error && (
          <div className="text-destructive font-medium">
            {Array.isArray(error) ? error.join(", ") : String(error)}
          </div>
        )}

        {/* Field errors */}
        {fieldErrors && Object.keys(fieldErrors).length > 0 && (
          <div className="mt-2 text-sm space-y-1 text-destructive">
            {Object.entries(fieldErrors).map(([field, errs]) => {
              const list = coerceArr(errs);
              return (
                <div key={field}>
                  <strong className="capitalize">{field}:</strong>{" "}
                  {list.join(", ")}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
