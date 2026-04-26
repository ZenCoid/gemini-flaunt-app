import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, XCircle } from "lucide-react";
import { cn } from "../../lib/utils";

interface UploadDropzoneProps {
  preview: string | null;
  onFile: (file: File) => void;
  onClear: () => void;
  disabled?: boolean;
}

export function UploadDropzone({ preview, onFile, onClear, disabled }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      onFile(file);
    }
  }, [disabled, onFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
  }, [onFile]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative rounded-[32px] transition-all duration-500 overflow-hidden",
        !preview ? "aspect-[4/5] glass-card cursor-pointer hover:border-white/20" : "aspect-auto max-h-[500px]",
        isDragging && "border-brand-pink bg-brand-pink/5 scale-[0.98]",
        disabled && "opacity-60 pointer-events-none"
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => !preview && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />

      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
          >
            <motion.div 
              className="relative mb-6"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Camera className="w-16 h-16 text-white/20" />
              <motion.div 
                className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-brand-pink/30 blur-xl"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            <h3 className="font-display italic text-2xl md:text-3xl text-white/80 mb-2">
              "Upload your fit."
            </h3>
            <p className="text-muted-foreground text-sm max-w-[200px]">
              Drag your outfit photo here or tap to browse
            </p>
            <p className="text-xs text-muted-foreground/60 mt-4">
              JPG, PNG, WebP up to 20MB
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full h-full"
          >
            <img
              src={preview}
              alt="Outfit preview"
              className="w-full h-full object-cover rounded-[32px]"
            />
            {!disabled && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); onClear(); }}
                className="absolute top-4 right-4 p-2.5 rounded-full glass hover:bg-white/10 text-white transition-all"
              >
                <XCircle className="w-5 h-5" />
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
