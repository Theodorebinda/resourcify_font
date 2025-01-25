"use client";
import React from "react";
import {
  Card,
  CardContent,
  //   CardDescription,
  //   CardFooter,
  //   CardHeader,
  //   CardTitle,
} from "@/src/components/ui/card";
// import { Button } from "./ui/button";
import LoginForm from "./loginForm";

const CardSing: React.FC = ({}) => {
  return (
    <Card className="bg-inherit text-inherit border-none ">
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  );
};

export default CardSing;
