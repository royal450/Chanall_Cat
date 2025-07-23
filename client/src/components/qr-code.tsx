import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export function QRCodeComponent({ value, size = 200, className = "" }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF"
        }
      }, (error) => {
        if (error) console.error("QR Code generation error:", error);
      });
    }
  }, [value, size]);

  const handleShare = async () => {
    if (canvasRef.current) {
      try {
        const canvas = canvasRef.current;
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], "payment-qr.png", { type: "image/png" });
            
            if (navigator.share && navigator.canShare({ files: [file] })) {
              try {
                await navigator.share({
                  title: "CourseMarket Payment QR",
                  text: "Scan this QR code to complete your payment",
                  files: [file]
                });
              } catch (shareError: any) {
                // Silently handle share cancellation
                if (shareError.name === 'AbortError' || shareError.message === 'Share canceled' || shareError.message?.includes('cancel')) {
                  console.log('Share cancelled by user');
                  return;
                }
                // For actual errors, fallback to download
                throw shareError;
              }
            } else {
              // Fallback: copy to clipboard or download
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'payment-qr.png';
              link.click();
              URL.revokeObjectURL(url);
              
              toast({
                title: "QR Code Downloaded! 📱",
                description: "QR code has been saved to your device",
              });
            }
          }
        });
      } catch (error) {
        // Fallback: copy to clipboard or download
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'payment-qr.png';
              link.click();
              URL.revokeObjectURL(url);
              
              toast({
                title: "QR Code Downloaded! 📱",
                description: "QR code has been saved to your device",
              });
            }
          });
        }
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas ref={canvasRef} className={className} />
      <Button
        onClick={handleShare}
        className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 hover:shadow-lg transform hover:scale-105"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share QR Code
      </Button>
    </div>
  );
}

export default QRCodeComponent;