import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Flag, AlertTriangle } from "lucide-react";
import CreateReport from "./CreateReport";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSelector } from "react-redux";

const ReportButton = ({ event }) => {
  const [open, setOpen] = useState(false);
  const { user } = useSelector((state) => state.user);

  if (!user) {
    return null;
  }

  const isOwner = user.id === event?.seller_info?.id;
  if (isOwner) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          <Flag className="h-4 w-4 mr-2" />
          Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Report this event
          </DialogTitle>
          <DialogDescription>
            Please provide details about why you're reporting "{event?.title}".
            This helps us take appropriate action.
          </DialogDescription>
        </DialogHeader>
        <CreateReport
          event={event}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ReportButton;
