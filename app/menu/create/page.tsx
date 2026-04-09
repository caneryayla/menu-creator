"use client";
import React from "react";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "radix-ui";
import { PlusIcon, Trash2, ChefHat, ArrowLeft } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useMenuStore } from "@/lib/menu-store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const MenuCreatePage = () => {
  const MenuCreateSchema = z.object({
    menuName: z
      .string()
      .trim()
      .min(2, { message: "Lütfen menü adınızı girin" }),
    menuImage: z.string().trim().optional(),
    dishList: z
      .array(
        z.object({
          dishId: z.uuid(),
          dishName: z
            .string()
            .trim()
            .min(2, { message: "Lütfen yemek adınızı girin" }),
          dishImage: z.string().trim().optional(),
          ingredients: z
            .array(
              z.object({
                ingredientId: z.uuid(),
                ingredientName: z
                  .string()
                  .trim()
                  .min(1, { message: "Lütfen malzeme adınızı girin" }),
              }),
            )
            .min(1, { message: "En az bir malzeme ekleyin" }),
          instructions: z
            .string()
            .trim()
            .min(1, { message: "Lütfen yapılışı yazın" }),
        }),
      )
      .min(1, { message: "En az bir yemek ekleyin" }),
  });

  type FormValues = z.infer<typeof MenuCreateSchema>;

  const form = useForm<FormValues>({
    defaultValues: {
      menuName: "",
      menuImage: "",
      dishList: [
        {
          dishId: uuidv4(),
          dishName: "",
          dishImage: "",
          ingredients: [
            {
              ingredientId: uuidv4(),
              ingredientName: "",
            },
          ],
          instructions: "",
        },
      ],
    },
    resolver: zodResolver(MenuCreateSchema),
  });

  const { addMenu } = useMenuStore();
  const router = useRouter();

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = form;

  const onSubmit = (data: FormValues) => {
    addMenu({
      menuName: data.menuName,
      menuImage: data.menuImage,
      dishList: data.dishList,
    });

    toast.success("Menü başarıyla oluşturuldu!", {
      description: `"${data.menuName}" menüsü ${data.dishList.length} yemek ile eklendi.`,
    });

    router.push("/");
  };

  return (
    <main className="w-full p-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3 ">
            <Button variant="outline" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <ChefHat className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Yeni Menü Oluştur</h1>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
          {/* Menü Bilgileri */}
          <div className="rounded-xl border p-6 shadow-sm bg-card">
            <h2 className="mb-4 text-xl font-semibold flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                1
              </span>
              Menü Bilgileri
            </h2>

            <div className="flex flex-col gap-4">
              <Controller
                control={control}
                name="menuName"
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <div className="flex flex-col gap-2">
                    <Label.Root className="text-sm font-medium">
                      Menü Adı <span className="text-destructive">*</span>
                    </Label.Root>
                    <Input
                      placeholder="Örn: Hafta Sonu Özel Menüsü"
                      onChange={(e) => onChange(e.target.value)}
                      value={value}
                      className={error ? "border-destructive" : ""}
                    />
                    {error && (
                      <span className="text-xs text-destructive">
                        {error.message}
                      </span>
                    )}
                  </div>
                )}
              />

              <Controller
                control={control}
                name="menuImage"
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <div className="flex flex-col gap-2">
                    <Label.Root className="text-sm font-medium">
                      Menü Görseli URL (İsteğe Bağlı)
                    </Label.Root>
                    <Input
                      type="url"
                      placeholder="https://ornek.com/gorsel.jpg"
                      onChange={(e) => onChange(e.target.value)}
                      value={value}
                    />
                    {error && (
                      <span className="text-xs text-destructive">
                        {error.message}
                      </span>
                    )}
                  </div>
                )}
              />
            </div>
          </div>

          <div className="flex flex-col rounded-xl border p-6 gap-5 shadow-sm bg-card">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  2
                </span>
                Yemekler
              </h2>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={() => {
                  setValue("dishList", [
                    ...watch("dishList"),
                    {
                      dishId: uuidv4(),
                      dishName: "",
                      dishImage: "",
                      ingredients: [
                        {
                          ingredientId: uuidv4(),
                          ingredientName: "",
                        },
                      ],
                      instructions: "",
                    },
                  ]);
                }}
              >
                <PlusIcon className="h-4 w-4" />
                Yemek Ekle
              </Button>
            </div>

            {watch("dishList").map((dish, index) => (
              <div key={dish.dishId} className="flex flex-col gap-5">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    Yemek #{index + 1}
                  </h3>
                  {watch("dishList").length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setValue(
                          "dishList",
                          watch("dishList").filter((_, i) => i !== index),
                        );
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      Sil
                    </Button>
                  )}
                </div>

                <Controller
                  control={control}
                  name={`dishList.${index}.dishId`}
                  render={({ field }) => (
                    <input type="hidden" {...field} value={field.value} />
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <Controller
                    control={control}
                    name={`dishList.${index}.dishName`}
                    render={({
                      field: { onChange, value },
                      fieldState: { error },
                    }) => (
                      <div className="flex flex-col gap-2">
                        <Label.Root className="text-sm font-medium">
                          Yemek Adı <span className="text-destructive">*</span>
                        </Label.Root>
                        <Input
                          placeholder="Örn: Fırında Tavuk"
                          onChange={(e) => onChange(e.target.value)}
                          value={value}
                          className={error ? "border-destructive" : ""}
                        />
                        {error && (
                          <span className="text-xs text-destructive">
                            {error.message}
                          </span>
                        )}
                      </div>
                    )}
                  />

                  <Controller
                    control={control}
                    name={`dishList.${index}.dishImage`}
                    render={({
                      field: { onChange, value },
                      fieldState: { error },
                    }) => (
                      <div className="flex flex-col gap-2">
                        <Label.Root className="text-sm font-medium">
                          Yemek Görseli URL (İsteğe Bağlı)
                        </Label.Root>
                        <Input
                          type="url"
                          placeholder="https://ornek.com/yemek-gorseli.jpg"
                          onChange={(e) => onChange(e.target.value)}
                          value={value}
                        />
                        {error && (
                          <span className="text-xs text-destructive">
                            {error.message}
                          </span>
                        )}
                      </div>
                    )}
                  />
                </div>

                <div className="flex flex-col gap-2 rounded-lg">
                  <div className="flex flex-wrap items-center justify-between">
                    <Label.Root className="text-sm font-medium">
                      Malzemeler <span className="text-destructive">*</span>
                    </Label.Root>
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={() => {
                        setValue(`dishList.${index}.ingredients`, [
                          ...watch(`dishList.${index}.ingredients`),
                          {
                            ingredientId: uuidv4(),
                            ingredientName: "",
                          },
                        ]);
                      }}
                    >
                      <PlusIcon className="h-3 w-3" />
                      Ekle
                    </Button>
                  </div>

                  <div
                    className={cn(
                      "grid gap-3 md:grid-cols-2",
                      watch(`dishList.${index}.ingredients`).length === 1 &&
                        "md:grid-cols-1",
                    )}
                  >
                    {watch(`dishList.${index}.ingredients`).map(
                      (ingredient, ingredientIndex) => (
                        <div
                          key={ingredient.ingredientId}
                          className="flex items-start gap-2"
                        >
                          <Controller
                            control={control}
                            name={`dishList.${index}.ingredients.${ingredientIndex}.ingredientName`}
                            render={({
                              field: { onChange, value },
                              fieldState: { error },
                            }) => (
                              <div className="flex flex-col w-full items-start gap-1">
                                <div className="flex items-center gap-2 w-full">
                                  <Input
                                    placeholder="Malzeme adı"
                                    value={value}
                                    onChange={(e) => onChange(e.target.value)}
                                    className={`flex-1 ${error ? "border-destructive" : ""}`}
                                  />

                                  {watch(`dishList.${index}.ingredients`)
                                    .length > 1 && (
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="icon"
                                      className="h-9 w-9 shrink-0"
                                      onClick={() => {
                                        setValue(
                                          `dishList.${index}.ingredients`,
                                          watch(
                                            `dishList.${index}.ingredients`,
                                          ).filter(
                                            (_, i) => i !== ingredientIndex,
                                          ),
                                        );
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>

                                {error?.message && (
                                  <span className="text-xs text-destructive">
                                    {error.message}
                                  </span>
                                )}
                              </div>
                            )}
                          />
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <Controller
                  control={control}
                  name={`dishList.${index}.instructions`}
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => (
                    <div className="flex flex-col gap-2">
                      <Label.Root className="text-sm font-medium">
                        Hazırlanışı <span className="text-destructive">*</span>
                      </Label.Root>
                      <textarea
                        placeholder="Yemeğin hazırlanış adımlarını detaylı bir şekilde yazın..."
                        value={value}
                        onChange={(event) => onChange(event.target.value)}
                        rows={6}
                        className={`w-full rounded-md border bg-background px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${error ? "border-destructive" : ""}`}
                      />
                      {error && (
                        <span className="text-xs text-destructive">
                          {error.message}
                        </span>
                      )}
                    </div>
                  )}
                />
              </div>
            ))}
          </div>

          {/* Submit Buttons */}
          <div className="sticky bottom-0 w-full flex items-center justify-end gap-3 rounded-xl border bg-card p-4 shadow-lg">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/")}
              className="md:flex-1"
            >
              İptal
            </Button>
            <Button type="submit" className="flex-1">
              <ChefHat className="mr-2 h-5 w-5" />
              Menü Oluştur
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default MenuCreatePage;
