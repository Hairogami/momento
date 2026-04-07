import { signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import HeroAnimation from "@/components/HeroAnimation";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <HeroAnimation />
      <div className="relative z-10 w-full max-w-sm px-4">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 text-4xl font-bold tracking-tight text-white">
              momento
            </div>
            <CardTitle className="text-white">Bienvenue</CardTitle>
            <CardDescription className="text-white/70">
              Organisez votre événement sans stress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">

            <form action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/dashboard" });
            }}>
              <Button className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30" variant="outline" type="submit">
                Continuer avec GitHub
              </Button>
            </form>

            <form action={async () => {
              "use server";
              await signIn("discord", { redirectTo: "/dashboard" });
            }}>
              <Button className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30" variant="outline" type="submit">
                Continuer avec Discord
              </Button>
            </form>

            <div className="flex items-center gap-2 my-1">
              <Separator className="flex-1 bg-white/20" />
              <span className="text-xs text-white/50">ou</span>
              <Separator className="flex-1 bg-white/20" />
            </div>

            <form action={async (formData: FormData) => {
              "use server";
              await signIn("resend", { email: formData.get("email"), redirectTo: "/dashboard" });
            }} className="space-y-2">
              <Label className="text-white/80">Email (lien magique)</Label>
              <Input name="email" type="email" placeholder="toi@exemple.com" required className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
              <Button className="w-full" type="submit">Recevoir un lien</Button>
            </form>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
