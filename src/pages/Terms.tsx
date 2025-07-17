import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Terms = () => {
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
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: January 17, 2025</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agreement to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                By accessing and using this service, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Description of Service</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Our service provides analytics and insights for Roblox developers by processing transaction data and calculating profit metrics including DevEx conversions, marketplace cuts, and advertising ROI.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Accurate Information</h3>
                <p className="text-sm text-muted-foreground">
                  You are responsible for providing accurate transaction data and maintaining the security of your account credentials.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Compliance</h3>
                <p className="text-sm text-muted-foreground">
                  You must comply with all applicable laws and Roblox's terms of service when using our platform.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Data Usage</h3>
                <p className="text-sm text-muted-foreground">
                  You may only upload transaction data that you own or have permission to use.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscription and Payments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Billing</h3>
                <p className="text-sm text-muted-foreground">
                  Subscription fees are billed in advance on a monthly basis and are non-refundable.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Cancellation</h3>
                <p className="text-sm text-muted-foreground">
                  You may cancel your subscription at any time. Cancellation will be effective at the end of the current billing period.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Price Changes</h3>
                <p className="text-sm text-muted-foreground">
                  We reserve the right to modify subscription prices with 30 days' notice.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data and Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We process your data in accordance with our Privacy Policy. You retain ownership of your transaction data, and we use it solely to provide our services.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Our service is provided "as is" without warranties. We are not liable for any damages arising from the use of our service, including but not limited to data loss or business interruption.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Termination</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We may terminate or suspend your account immediately if you breach these terms. Upon termination, your right to use the service will cease immediately.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                If you have any questions about these Terms of Service, please contact us at legal@robloxprofit.com
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Terms;