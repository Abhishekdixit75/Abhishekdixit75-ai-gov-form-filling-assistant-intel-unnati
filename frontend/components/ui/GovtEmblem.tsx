
import Image from 'next/image';
import { cn } from "@/lib/utils";

export default function GovtEmblem({ className }: { className?: string }) {
    return (
        <div className={cn("relative flex items-center gap-3", className)}>
            <div className="relative h-full aspect-[2/3]">
                <Image
                    src="/gov_logo.png"
                    alt="Satyameva Jayate"
                    fill
                    className="object-contain drop-shadow-md"
                    priority
                />
            </div>

            {/* Divider */}
            <div className="h-[60%] w-px bg-current opacity-20"></div>

            <div className="relative h-full aspect-square">
                <Image
                    src="/azadi.png"
                    alt="Azadi Ka Amrit Mahotsav"
                    fill
                    className="object-contain drop-shadow-md"
                    priority
                />
            </div>
        </div>
    );
}
