"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function TermsModal({ open, onOpenChange, onAgree, onCancel }) {
  const [canAgree, setCanAgree] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Terms &amp; Conditions</DialogTitle>
        </DialogHeader>

        <ScrollArea
          className="max-h-[50vh] rounded-md border p-4"
          onScrollCapture={(e) => {
            const el = e.currentTarget;
            const reached =
              el.scrollTop + el.clientHeight >= el.scrollHeight - 12;
            if (reached) setCanAgree(true);
          }}
        >
          <div className="space-y-4 text-sm text-muted-foreground">
            {/* Replace with your real terms text */}
            {Array.from({ length: 24 }).map((_, i) => (
              <p key={i}>
                Sample terms section {i + 1}. Lorem ipsum dolor sit amet,
                consectetur adipisicing elit. Necessitatibus, molestias.
              </p>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onAgree} disabled={!canAgree}>
            Agree
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
