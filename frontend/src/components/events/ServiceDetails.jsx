import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Utensils,
  Building2,
  Speaker,
  Camera,
  Film,
  Cake,
  Sparkles,
  Blocks,
} from "lucide-react";

const ICONS = {
  catering: Utensils,
  hall_booking: Building2,
  sound_system: Speaker,
  photography: Camera,
  videography: Film,
  cake: Cake,
  decoration: Sparkles,
  conference_setup: Blocks,
  stage_setup: Building2,
};

export default function ServiceDetails({ items = [] }) {
  if (!items?.length) return null;

  return (
    <div className="rounded-2xl border p-4">
      <h3 className="mb-3 text-lg font-semibold">Included Services</h3>
      <Accordion type="single" collapsible className="w-full">
        {items.map((s, idx) => {
          const Icon = ICONS[s.service] ?? Sparkles;
          const title = humanize(s.service);
          const price =
            s.price && s.price !== "0.00"
              ? `৳${Number(s.price).toLocaleString()}`
              : "Included";
          return (
            <AccordionItem key={idx} value={`item-${idx}`}>
              <AccordionTrigger className="py-3">
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{title}</span>
                  <Badge
                    variant={s.is_available ? "secondary" : "destructive"}
                    className="ml-2"
                  >
                    {s.is_available ? "Available" : "Unavailable"}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-2 rounded-xl bg-muted/30 p-3 text-sm">
                  <div className="text-muted-foreground">
                    {s.short_description}
                  </div>
                  <div>
                    <span className="font-medium">Price:</span> {price}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}

function humanize(str = "") {
  return str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
