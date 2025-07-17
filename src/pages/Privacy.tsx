import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Privacy = () => {
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
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: January 17, 2025</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Account Information</h3>
                <p className="text-sm text-muted-foreground">
                  We collect your email address and any profile information you provide when creating an account.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Transaction Data</h3>
                <p className="text-sm text-muted-foreground">
                  We process the Roblox transaction data you upload to provide analytics and insights. This includes sales data, item names, and revenue information.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Usage Information</h3>
                <p className="text-sm text-muted-foreground">
                  We collect information about how you use our service, including features accessed and time spent on the platform.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Service Provision</h3>
                <p className="text-sm text-muted-foreground">
                  We use your data to provide profit analytics, generate reports, and deliver the core functionality of our platform.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Communication</h3>
                <p className="text-sm text-muted-foreground">
                  We may send you service-related emails, including weekly reports and important updates about your account.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Improvement</h3>
                <p className="text-sm text-muted-foreground">
                  We analyze usage patterns to improve our service and develop new features.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Security</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Your data is encrypted in transit and at rest.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Sharing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We do not sell, trade, or rent your personal information to third parties. We may share aggregated, non-identifying information for analytical purposes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Access and Correction</h3>
                <p className="text-sm text-muted-foreground">
                  You can access and update your account information through your dashboard settings.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Data Deletion</h3>
                <p className="text-sm text-muted-foreground">
                  You can request deletion of your account and associated data by contacting our support team.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Data Portability</h3>
                <p className="text-sm text-muted-foreground">
                  You can export your transaction data at any time through your dashboard.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                If you have any questions about this Privacy Policy, please contact us at privacy@robloxprofit.com
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Privacy;