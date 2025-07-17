import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";
import { Upload, FileText, TrendingUp, BarChart3, DollarSign, LogIn } from "lucide-react";
import Papa from "papaparse";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, session } = useAuth();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

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
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-16">
        {/* Navigation */}
        <div className="flex justify-end mb-8">
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              asChild
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Link to="/login">
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Link>
            </Button>
            <Button 
              variant="secondary" 
              asChild
            >
              <Link to="/signup">
                Get Started
              </Link>
            </Button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 text-white">
            Know your <span className="text-secondary">True</span> Roblox Profit
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Drag your monthly sales CSV — we'll translate Robux into rent money.
          </p>
        </div>

        {/* Upload Section */}
        <div className="max-w-2xl mx-auto mb-16">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-8">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
                  isDragActive 
                    ? "border-secondary bg-secondary/10" 
                    : "border-white/30 hover:border-white/50"
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 text-white/70 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {isDragActive ? "Drop your CSV here" : "Upload your Roblox sales CSV"}
                </h3>
                <p className="text-white/70 mb-4">
                  {isDragActive 
                    ? "Release to upload" 
                    : "Drag and drop your CSV file here, or click to browse"
                  }
                </p>
                <Button 
                  variant="secondary" 
                  disabled={isUploading}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  {isUploading ? "Processing..." : "Choose File"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">True Profit Tracking</h3>
              <p className="text-white/70">
                See your real USD earnings after all Roblox fees and DevEx calculations
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-8 w-8 text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Waterfall Analysis</h3>
              <p className="text-white/70">
                Visualize how your Robux transforms into actual dollars step by step
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6 text-center">
              <DollarSign className="h-8 w-8 text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">ROI Calculator</h3>
              <p className="text-white/70">
                Calculate your return on investment for advertising and promotional spend
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
