"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getSupabaseClient } from "@/lib/supabase/client";

type ComplaintStatus = "baru" | "diproses" | "selesai" | "ditolak";

export default function LaporPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [judul, setJudul] = React.useState("");
  const [lokasi, setLokasi] = React.useState("");
  const [isi, setIsi] = React.useState("");

  React.useEffect(() => {
    let ignore = false;

    async function init() {
      let supabase;
      try {
        supabase = getSupabaseClient();
      } catch (err) {
        if (ignore) return;
        setError(err instanceof Error ? err.message : "Supabase is not configured.");
        setLoading(false);
        return;
      }

      const { data, error: sessionError } = await supabase.auth.getSession();
      if (ignore) return;

      if (sessionError || !data.session) {
        router.push("/login");
        return;
      }

      // Role check for admin/petugas redirect
      const user = data.session.user;
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      const isAdminEmail = user.email === "laporin.service@gmail.com";
      if (profile?.role === "admin" || profile?.role === "petugas" || isAdminEmail) {
        router.push("/admin");
        return;
      }

      setLoading(false);
    }

    init();

    return () => {
      ignore = true;
    };
  }, [router]);

  async function onLogout() {
    let supabase;
    try {
      supabase = getSupabaseClient();
    } catch {
      router.push("/");
      return;
    }
    await supabase.auth.signOut();
    router.push("/");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    let supabase;
    try {
      supabase = getSupabaseClient();
    } catch (err) {
      setSubmitting(false);
      setError(err instanceof Error ? err.message : "Supabase is not configured.");
      return;
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      setSubmitting(false);
      router.push("/login");
      return;
    }

    const userId = sessionData.session.user.id;

    const { error: insertError } = await supabase.from("complaints").insert({
      user_id: userId,
      title: judul,
      location: lokasi,
      description: isi,
      status: "baru" satisfies ComplaintStatus,
    });

    setSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setJudul("");
    setLokasi("");
    setIsi("");

    router.push("/lapor?ok=1");
  }

  if (loading) {
    return <div className="min-h-dvh" />;
  }

  return (
    <div className="min-h-dvh px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <PageTransition>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Buat Pengaduan</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Isi detail laporan kamu. Tim akan menindaklanjuti.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                href="/admin"
              >
                Admin
              </Link>
              <Button variant="outline" onClick={onLogout}>
                Keluar
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Form Pengaduan</CardTitle>
              <CardDescription>
                Judul singkat, lokasi, dan kronologi/penjelasan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={onSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="judul">Judul</Label>
                  <Input
                    id="judul"
                    value={judul}
                    onChange={(e) => setJudul(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lokasi">Lokasi</Label>
                  <Input
                    id="lokasi"
                    value={lokasi}
                    onChange={(e) => setLokasi(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="isi">Deskripsi</Label>
                  <Textarea
                    id="isi"
                    value={isi}
                    onChange={(e) => setIsi(e.target.value)}
                    required
                  />
                </div>

                {error ? (
                  <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
                    {error}
                  </div>
                ) : null}

                <Button className="w-full" type="submit" disabled={submitting}>
                  {submitting ? "Mengirim..." : "Kirim Pengaduan"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </PageTransition>
      </div>
    </div>
  );
}
