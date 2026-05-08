import { Card } from '@/Components/ui/Card';

export function UnderDevelopment() {
    return (
        <Card className="mb-0 flex h-[calc(100dvh-9rem)] max-h-[calc(100dvh-9rem)] flex-col items-center justify-center gap-6 overflow-hidden rounded-none border-none p-6 text-center sm:p-8">
            <div className="flex shrink-0 justify-center">
                <img
                    alt="Sedang Dikembangkan"
                    className="h-auto max-h-[45vh] w-full max-w-[22rem] object-contain"
                    src="/underdev.gif"
                />
            </div>
            <div className="shrink-0 space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-gray-800">Fitur Sedang Dikembangkan</h2>
                <p className="mx-auto max-w-xl text-sm text-gray-400">
                    Sedang dalam proses pengembangan, silahkan cek kembali beberapa waktu kedepan.
                </p>
            </div>
        </Card>
    );
}
