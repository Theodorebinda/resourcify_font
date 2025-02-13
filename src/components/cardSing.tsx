"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import LoginForm from "./loginForm";
// import { Button } from "./ui/button";

const CardSing: React.FC = ({}) => {
  return (
    <Card className="bg-[#1c1d22] text-inherit border-none w-full ">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  );
};

export default CardSing;
