"use client";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { useToast } from "@/src/hooks/use-toast";

const formSchema = z.object({
  email: z.string().email().min(2).max(50),
  password: z.string().min(4).max(10),
});

const LoginForm: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function authenticate(data: z.infer<typeof formSchema>) {
    setIsLoading(true); // Activer l'état de chargement
    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        // Gérer les erreurs de réponse HTTP (400, 500, etc.)
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to authenticate");
      }

      const responseData = await response.json();

      // Afficher un toast de succès
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.email}!`,
        // variant: "success",
      });

      // Traitez la réponse ici (par exemple, stocker le token, redirection, etc.)
      console.log(responseData);
    } catch (error: any) {
      // Afficher un toast d'erreur
      toast({
        title: "Login failed",
        description: error.message || "An error occurred.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false); // Désactiver le chargement
    }
  }

  // Soumission du formulaire
  function onSubmit(data: z.infer<typeof formSchema>) {
    authenticate(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Loading..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
};

export default LoginForm;
