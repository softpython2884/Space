"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Sparkles, Terminal } from "lucide-react";

import { getUpgradeAdviceAction } from "@/app/actions";
import { INITIAL_PLAYER_DATA, SHIP_TYPES } from "@/lib/constants";
import type { UpgradeAdviceOutput } from "@/ai/flows/upgrade-advisor";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  level: z.coerce.number().min(1, "Level must be at least 1."),
  shipType: z.enum(SHIP_TYPES),
  money: z.coerce.number().min(0, "Money cannot be negative."),
  ore: z.coerce.number().min(0, "Ore cannot be negative."),
  gas: z.coerce.number().min(0, "Gas cannot be negative."),
});

export function UpgradeInterface() {
  const [advice, setAdvice] = useState<UpgradeAdviceOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      level: INITIAL_PLAYER_DATA.level,
      shipType: INITIAL_PLAYER_DATA.shipType,
      money: INITIAL_PLAYER_DATA.resources.money,
      ore: INITIAL_PLAYER_DATA.resources.ore,
      gas: INITIAL_PLAYER_DATA.resources.gas,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setAdvice(null);

    const input = {
      resources: {
        money: values.money,
        ore: values.ore,
        gas: values.gas,
      },
      shipType: values.shipType,
      level: values.level,
      currentUpgrades: INITIAL_PLAYER_DATA.upgrades,
    };

    const result = await getUpgradeAdviceAction(input);

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    } else {
      setAdvice(result.advice);
    }

    setIsLoading(false);
  }

  return (
    <Card className="bg-secondary/40 border-secondary">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Ship Upgrades</CardTitle>
        <CardDescription>
          Manage your ship's enhancements and get AI-powered advice.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2 font-headline">Current Upgrades</h3>
            <div className="space-y-2">
              {Object.entries(INITIAL_PLAYER_DATA.upgrades).map(([name, level]) => (
                <div key={name} className="flex items-center justify-between p-2 rounded-md bg-background/50">
                  <span className="text-sm font-medium">{name}</span>
                  <Badge variant="default">Level {level}</Badge>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-2 font-headline flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Upgrade Advisor
            </h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Player Level</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="shipType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ship Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select ship type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SHIP_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormField control={form.control} name="money" render={({ field }) => (
                        <FormItem><FormLabel>Money</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="ore" render={({ field }) => (
                        <FormItem><FormLabel>Ore</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="gas" render={({ field }) => (
                        <FormItem><FormLabel>Gas</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Analyzing..." : "Get Upgrade Advice"}
                </Button>
              </form>
            </Form>
          </div>
          
          {isLoading && (
            <div className="space-y-4 pt-4">
                <Skeleton className="h-8 w-1/2" />
                <div className="space-y-2">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                </div>
            </div>
          )}

          {advice && advice.suggestedUpgrades.length > 0 && (
            <div className="pt-4">
              <h4 className="font-headline text-md mb-2">Suggestions:</h4>
              <div className="space-y-4">
                {advice.suggestedUpgrades.map((suggestion, index) => (
                    <Alert key={index} className="bg-background/50">
                        <Lightbulb className="h-4 w-4 text-primary" />
                        <AlertTitle className="font-bold text-primary">{suggestion.upgradeName}</AlertTitle>
                        <AlertDescription>{suggestion.reasoning}</AlertDescription>
                    </Alert>
                ))}
              </div>
            </div>
          )}

          {advice && advice.suggestedUpgrades.length === 0 && (
             <Alert className="mt-4">
                <Terminal className="h-4 w-4" />
                <AlertTitle>No suggestions</AlertTitle>
                <AlertDescription>
                    The AI couldn't find any optimal upgrades with your current resources. Try gathering more resources.
                </AlertDescription>
            </Alert>
          )}

        </div>
      </CardContent>
    </Card>
  );
}
