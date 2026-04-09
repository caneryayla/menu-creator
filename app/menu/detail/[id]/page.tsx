"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useMenuStore } from "@/lib/menu-store";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Edit,
  Trash2,
  ChefHat,
  UtensilsCrossed,
  Download,
} from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const MenuDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { menus, deleteMenu } = useMenuStore();

  const menu = menus.find((m) => m.id === params.id);

  const turkishToEnglish = (text: string): string => {
    const charMap: { [key: string]: string } = {
      ı: "i",
      ğ: "g",
      ü: "u",
      ş: "s",
      ö: "o",
      ç: "c",
      İ: "I",
      Ğ: "G",
      Ü: "U",
      Ş: "S",
      Ö: "O",
      Ç: "C",
    };
    return text.replace(/[ığüşöçİĞÜŞÖÇ]/g, (char) => charMap[char] || char);
  };

  if (!menu) {
    return (
      <main className="mx-auto min-h-[calc(100svh-64px)] w-full max-w-2xl p-6">
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <ChefHat className="h-16 w-16 text-muted-foreground" />
          <h1 className="text-2xl font-bold">Menü Bulunamadı</h1>
          <p className="text-muted-foreground">
            Bu menü mevcut değil veya silinmiş olabilir.
          </p>
          <Button asChild>
            <Link href="/">Ana Sayfaya Dön</Link>
          </Button>
        </div>
      </main>
    );
  }

  const handleDelete = () => {
    deleteMenu(menu.id);
    toast.success("Menü başarıyla silindi!", {
      description: `"${menu.menuName}" menüsü kaldırıldı.`,
    });
    router.push("/");
  };

  const handleSavePdf = async () => {
    if (!menu) return;

    try {
      const jsPDF = (await import("jspdf")).default;
      const doc = new jsPDF();

      let yPosition = 20;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      const maxWidth = 170;

      // Başlık
      doc.setFontSize(18);
      doc.text(turkishToEnglish(menu.menuName), margin, yPosition);
      yPosition += 10;

      // Tarih
      doc.setFontSize(10);
      const dateText = `Olusturulma: ${new Date(menu.createdAt).toLocaleDateString("tr-TR")}`;
      doc.text(turkishToEnglish(dateText), margin, yPosition);
      yPosition += 15;

      // Yemekler
      menu.dishList.forEach((dish, index) => {
        // Sayfa sonu kontrolü
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 20;
        }

        // Yemek başlığı
        doc.setFontSize(14);
        doc.text(
          turkishToEnglish(`${index + 1}. ${dish.dishName}`),
          margin,
          yPosition,
        );
        yPosition += 10;

        // Malzemeler
        doc.setFontSize(11);
        doc.text("MALZEMELER:", margin, yPosition);
        yPosition += 7;

        doc.setFontSize(10);
        dish.ingredients.forEach((ing) => {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(
            turkishToEnglish(`- ${ing.ingredientName}`),
            margin + 5,
            yPosition,
          );
          yPosition += 6;
        });

        yPosition += 3;

        // Hazırlanışı
        doc.setFontSize(11);
        doc.text("HAZIRLANISI:", margin, yPosition);
        yPosition += 7;

        doc.setFontSize(10);
        const instructionLines = doc.splitTextToSize(
          turkishToEnglish(dish.instructions),
          maxWidth,
        );

        instructionLines.forEach((line: string) => {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, margin, yPosition);
          yPosition += 6;
        });

        yPosition += 10;
      });

      doc.save(
        `${menu.menuName.replace(/[^a-zığüşöçİĞÜŞÖÇ0-9]/gi, "_")}_menu.pdf`,
      );

      toast.success("PDF basariyla olusturuldu!", {
        description: `${menu.menuName} menusu indirildi.`,
      });
    } catch (error) {
      toast.error("PDF olusturulurken bir hata olustu!", {
        description: "Lutfen tekrar deneyin.",
      });
      console.error("PDF Error:", error);
    }
  };

  return (
    <main className="mx-auto min-h-[calc(100svh-64px)] w-full max-w-5xl p-6">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button variant="outline" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{menu.menuName}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {menu.dishList.length} yemek • Oluşturulma:{" "}
              {new Date(menu.createdAt).toLocaleDateString("tr-TR")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="default" onClick={handleSavePdf}>
            <Download className="h-4 w-4" />
            PDF İndir
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/menu/edit/${menu.id}`}>
              <Edit className="h-4 w-4" />
              Düzenle
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4" />
                Sil
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Menüyü silmek istediğinize emin misiniz?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Bu işlem geri alınamaz. &quot;{menu.menuName}&quot; menüsü ve
                  içindeki tüm yemekler kalıcı olarak silinecektir.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>İptal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-700 text-destructive-foreground hover:bg-red-600"
                >
                  Evet, Sil
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Menu Image */}
      {menu.menuImage && (
        <div className="mb-8 overflow-hidden rounded-xl border shadow-sm">
          <img
            src={menu.menuImage}
            alt={menu.menuName}
            className="h-80 w-full object-cover"
          />
        </div>
      )}

      {/* Dishes */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <UtensilsCrossed className="h-6 w-6 text-primary" />
          Yemekler
        </h2>

        <div className="grid gap-6">
          {menu.dishList.map((dish, index) => (
            <article
              key={dish.dishId}
              className="flex flex-col gap-5 rounded-xl border bg-card p-6 shadow-sm"
            >
              <div className="mb-4 flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold">{dish.dishName}</h3>
                </div>
              </div>

              {dish.dishImage && (
                <div className="mb-6 overflow-hidden rounded-lg">
                  <img
                    src={dish.dishImage}
                    alt={dish.dishName}
                    className="h-80 w-full object-cover"
                  />
                </div>
              )}

              {/* Ingredients */}
              <div>
                <h4 className="mb-3 text-lg font-semibold text-primary">
                  Malzemeler
                </h4>
                <ul className="space-y-2">
                  {dish.ingredients.map((ingredient) => (
                    <li
                      key={ingredient.ingredientId}
                      className="flex items-start gap-2 text-sm"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{ingredient.ingredientName}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions */}
              <div>
                <h4 className="mb-1 text-lg font-semibold text-primary">
                  Hazırlanışı
                </h4>
                <p className="whitespace-pre-line text-sm leading-relaxed">
                  {dish.instructions}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
};

export default MenuDetailPage;
