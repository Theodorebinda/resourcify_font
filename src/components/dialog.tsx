import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import CardSing from "./cardSing";

const CustomDialog = ({}) => {
  return (
    <Dialog>
      <DialogTrigger>Sign In</DialogTrigger>
      <DialogContent className="bg-[#090911] border border-slate-500">
        <DialogHeader className="flex justify-center items-center">
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription className="px-5">
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
        <CardSing />
      </DialogContent>
    </Dialog>
  );
};

export default CustomDialog;
