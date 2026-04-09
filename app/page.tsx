"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useMenuStore, type MenuItem } from "@/lib/menu-store";
import { toast } from "sonner";

export default function Page() {
  const { menus } = useMenuStore();

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

  const handleSavePdf = async (menu: MenuItem) => {
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
    <main className="mx-auto flex min-h-[calc(100svh-64px)] w-full max-w-5xl flex-col gap-3 p-6">
      <div className="flex items-center justify-between ">
        <h1 className="text-xl font-bold">Kayıtlı Menüler</h1>
        <Button asChild size="lg">
          <Link href="/menu/create">Menü Oluştur</Link>
        </Button>
      </div>

      {menus.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          Henüz menü yok. Yeni bir menü oluştur.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {menus.map((menu) => (
            <article
              key={menu.id}
              className="group rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md"
            >
              <div className="relative mb-4 h-48 w-full overflow-hidden rounded-lg bg-muted">
                {menu.menuImage ? (
                  <img
                    src={menu.menuImage}
                    alt={menu.menuName}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    Görsel Yok
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-xl font-semibold">{menu.menuName}</h2>

                  <div className="flex w-fit items-center gap-2 rounded-full bg-chart-1 px-3 py-0.5">
                    <span className="text-sm font-medium text-white">
                      {menu.dishList.length} yemek
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="default"
                    size={"lg"}
                    asChild
                    className="flex-1 text-white"
                  >
                    <Link href={`/menu/detail/${menu.id}`}>Detayları Gör</Link>
                  </Button>

                  <Button
                    variant="outline"
                    size={"lg"}
                    className="flex-1"
                    onClick={() => handleSavePdf(menu)}
                  >
                    <span>PDF Olarak İndir</span>
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
