import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";
import { Upload, FileText, TrendingUp, BarChart3, DollarSign, LogIn, Play } from "lucide-react";
import Papa from "papaparse";
import { SeatCounter } from "@/components/SeatCounter";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/SiteLayout";

const Index = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, session } = useAuth();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleDemoData = useCallback(async () => {
    // Check if user is authenticated
    if (!user || !session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to try demo data",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    setIsLoadingDemo(true);

    try {
      const { data, error } = await supabase.functions.invoke('seed_demo');

      if (error) {
        console.error('Error creating demo data:', error);
        toast({
          title: "Demo Failed",
          description: "Failed to create demo data. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data?.success) {
        toast({
          title: "Demo Data Created",
          description: `Created ${data.transactionCount} sample transactions. Data expires in 24 hours.`,
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Demo Failed",
          description: "Failed to create demo data. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error calling demo function:', error);
      toast({
        title: "Demo Failed",
        description: "An error occurred while creating demo data",
        variant: "destructive",
      });
    } finally {
      setIsLoadingDemo(false);
    }
  }, [toast, navigate, user, session]);

  const handleUpload = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    if (file.type !== "text/csv") {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    // Check if user is authenticated
    if (!user || !session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upload CSV files",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    setIsUploading(true);

    try {
      // Parse CSV to validate format and get data
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          const requiredColumns = ["Date", "Source", "Item", "Robux"];
          const columns = results.meta?.fields || [];
          
          const hasRequiredColumns = requiredColumns.every(col => 
            columns.some(field => field.toLowerCase().includes(col.toLowerCase()))
          );

          if (!hasRequiredColumns) {
            toast({
              title: "Invalid CSV format",
              description: "Please ensure your CSV has Date, Source, Item, and Robux columns",
              variant: "destructive",
            });
            setIsUploading(false);
            return;
          }

          try {
            // Call the edge function to process the CSV
            const { data, error } = await supabase.functions.invoke('parse_csv', {
              body: {
                csvData: results.data,
                filename: file.name
              }
            });

            if (error) {
              console.error('Error processing CSV:', error);
              toast({
                title: "Processing Failed",
                description: "Failed to process your CSV file. Please try again.",
                variant: "destructive",
              });
              setIsUploading(false);
              return;
            }

            if (data?.success) {
              toast({
                title: "Upload Successful",
                description: `Processed ${data.processedCount} transactions successfully!`,
              });
              navigate("/dashboard");
            } else {
              toast({
                title: "Processing Failed",
                description: "There was an error processing your CSV file.",
                variant: "destructive",
              });
            }
          } catch (error) {
            console.error('Error calling edge function:', error);
            toast({
              title: "Upload Failed",
              description: "An error occurred while processing your file",
              variant: "destructive",
            });
          }
          
          setIsUploading(false);
        },
        error: (error) => {
          toast({
            title: "Error parsing CSV",
            description: "Please check your file format and try again",
            variant: "destructive",
          });
          setIsUploading(false);
        },
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "An error occurred while processing your file",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  }, [toast, navigate, user, session]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleUpload,
    accept: {
      "text/csv": [".csv"],
    },
    maxFiles: 1,
  });

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-16">

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 text-slate-50">
            Know your <span className="text-brand-green">True</span> Roblox Profit
          </h1>
          <p className="text-xl text-slate-200 mb-8 max-w-2xl mx-auto">
            Drag your monthly sales CSV — we'll translate Robux into rent money.
          </p>
          <div className="flex justify-center mb-6">
            <SeatCounter className="text-slate-50 bg-white/20 hover:bg-white/30" />
          </div>
        </div>

        {/* Upload Section */}
        <div className="max-w-2xl mx-auto mb-16">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-8">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
                  isDragActive 
                    ? "border-brand-green bg-brand-green/10" 
                    : "border-white/30 hover:border-brand-green"
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-50 mb-2">
                  {isDragActive ? "Drop your CSV here" : "Upload your Roblox sales CSV"}
                </h3>
                <p className="text-slate-300 mb-4">
                  {isDragActive 
                    ? "Release to upload" 
                    : "Drag and drop your CSV file here, or click to browse"
                  }
                </p>
                <div className="flex flex-col items-center gap-4">
                  <Button 
                    variant="secondary" 
                    disabled={isUploading}
                    className="bg-white/20 hover:bg-white/30 text-slate-50 border-white/30"
                  >
                    {isUploading ? "Processing..." : "Choose File"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleDemoData}
                    disabled={isLoadingDemo}
                    className="bg-white/10 hover:bg-white/20 text-slate-50 border-white/30"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {isLoadingDemo ? "Loading..." : "Try Demo Data"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card className="rounded-2xl p-6 bg-white/10 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-300 border-white/20">
            <CardContent className="p-0 text-center">
              <TrendingUp className="h-8 w-8 text-brand-green mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-50 mb-2">True Profit Tracking</h3>
              <p className="text-slate-300">
                See your real USD earnings after all Roblox fees and DevEx calculations
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl p-6 bg-white/10 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-300 border-white/20">
            <CardContent className="p-0 text-center">
              <BarChart3 className="h-8 w-8 text-brand-green mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-50 mb-2">Waterfall Analysis</h3>
              <p className="text-slate-300">
                Visualize how your Robux transforms into actual dollars step by step
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl p-6 bg-white/10 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-300 border-white/20">
            <CardContent className="p-0 text-center">
              <DollarSign className="h-8 w-8 text-brand-green mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-50 mb-2">ROI Calculator</h3>
              <p className="text-slate-300">
                Calculate your return on investment for advertising and promotional spend
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </SiteLayout>
  );
};

export default Index;
