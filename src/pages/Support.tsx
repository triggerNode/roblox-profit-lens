import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle, Mail, MessageCircle } from "lucide-react";

const Support = () => {
  return (
    <AppLayout>
      <div className="flex-1 space-y-6 p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Support</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">How do I upload my CSV file?</h4>
                <p className="text-sm text-muted-foreground">
                  Simply drag and drop your Roblox Creator Dashboard export file onto the landing page, or click to browse and select the file.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">What CSV format is supported?</h4>
                <p className="text-sm text-muted-foreground">
                  We support the standard Roblox Creator Dashboard export format with Date, Source, Item, and Robux columns.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">How is the DevEx rate calculated?</h4>
                <p className="text-sm text-muted-foreground">
                  The default rate is $0.0035 per Robux, but you can customize this in Settings if you have a different rate.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Contact Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="How can we help you?" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea 
                  id="message" 
                  placeholder="Describe your issue or question..." 
                  className="min-h-32"
                />
              </div>
              <Button className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <h4 className="font-medium">1. Export Your Data</h4>
                <p className="text-sm text-muted-foreground">
                  Go to your Roblox Creator Dashboard and export your sales data as a CSV file.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">2. Upload & Analyze</h4>
                <p className="text-sm text-muted-foreground">
                  Upload your CSV file to see your true profit after all fees and DevEx calculations.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">3. Track Performance</h4>
                <p className="text-sm text-muted-foreground">
                  Monitor your top-performing items and track your profit trends over time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Support;