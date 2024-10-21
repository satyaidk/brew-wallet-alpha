import Image from "next/image";

type LoadingIndicatorProps = {
  text: string;
  image?: string;
  color?: string;
};

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ text, image, color }) => {
  return (
    <span className="flex items-center justify-center gap-2 animate-pulse" style={{ color: color }}>
      <Image
        src={ image ?? "/icons/bloader.svg"} // Update with the correct path to your image
        alt="Loading indicator"
        width={30} // Set the desired width
        height={30} // Set the desired height
        className="mr-2 h-5 w-5 animate-ping"
      />
      {text}
    </span>
  );
};

export default LoadingIndicator;