import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Cookies = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <h1 className="text-4xl font-bold mb-4">Cookie Policy</h1>
          <p className="text-muted-foreground">Last updated: January 17, 2025</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>What Are Cookies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and improving our service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How We Use Cookies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Essential Cookies</h3>
                <p className="text-sm text-muted-foreground">
                  These cookies are necessary for the website to function and cannot be switched off. They include authentication cookies and session management.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Analytics Cookies</h3>
                <p className="text-sm text-muted-foreground">
                  We use analytics cookies to understand how visitors interact with our website, helping us improve our service.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Preference Cookies</h3>
                <p className="text-sm text-muted-foreground">
                  These cookies remember your preferences such as theme settings and language preferences.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Third-Party Cookies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Payment Processing</h3>
                <p className="text-sm text-muted-foreground">
                  We use Stripe for payment processing, which may set cookies to ensure secure transactions.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  We use analytics services that may set cookies to help us understand user behavior and improve our service.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Managing Cookies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Browser Settings</h3>
                <p className="text-sm text-muted-foreground">
                  You can control cookies through your browser settings. Most browsers allow you to refuse cookies or delete existing ones.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Cookie Consent</h3>
                <p className="text-sm text-muted-foreground">
                  You can manage your cookie preferences through our cookie consent banner that appears when you first visit our site.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cookie Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Session cookies are deleted when you close your browser. Persistent cookies remain on your device for a specified period or until you delete them.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                If you have any questions about our use of cookies, please contact us at cookies@robloxprofit.com
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cookies;