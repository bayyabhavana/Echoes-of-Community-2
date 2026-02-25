import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUpdateProfile } from '@/hooks/useUserProfile';
import { useFileUpload } from '@/hooks/useFileUpload';
import { toast } from 'sonner';

const profileSchema = z.object({
    bio: z.string().max(160, 'Bio must be 160 characters or less').optional(),
    avatar: z.string().optional(),
    location: z.string().max(50, 'Location must be 50 characters or less').optional(),
    website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface EditProfileDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: string;
    currentData: {
        bio?: string;
        avatar?: string;
        location?: string;
        website?: string;
    };
}

export default function EditProfileDialog({
    open,
    onOpenChange,
    userId,
    currentData,
}: EditProfileDialogProps) {
    const updateProfile = useUpdateProfile();
    const { uploadFile, isUploading } = useFileUpload();
    const [previewUrl, setPreviewUrl] = useState<string>(currentData.avatar || '');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            bio: currentData.bio || '',
            avatar: currentData.avatar || '',
            location: currentData.location || '',
            website: currentData.website || '',
        },
    });

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const url = await uploadFile(file);
            setPreviewUrl(url);
            form.setValue('avatar', url);
            toast.success('Avatar uploaded successfully');
        } catch (error) {
            // Error is already handled in useFileUpload
        }
    };

    const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const file = event.dataTransfer.files?.[0];
        if (!file) return;

        try {
            const url = await uploadFile(file);
            setPreviewUrl(url);
            form.setValue('avatar', url);
            toast.success('Avatar uploaded successfully');
        } catch (error) {
            // Error is already handled in useFileUpload
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const onSubmit = async (data: ProfileFormData) => {
        try {
            await updateProfile.mutateAsync({ userId, data });
            toast.success('Profile updated successfully');
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.message || 'Failed to update profile');
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Avatar Upload Section */}
                        <div className="space-y-3">
                            <FormLabel>Profile Picture</FormLabel>

                            {/* Avatar Preview */}
                            <div className="flex justify-center">
                                <Avatar className="h-24 w-24 border-4 border-border">
                                    <AvatarImage src={previewUrl} alt="Avatar preview" />
                                    <AvatarFallback className="text-2xl">
                                        {getInitials('User')}
                                    </AvatarFallback>
                                </Avatar>
                            </div>

                            {/* File Upload Area */}
                            <div
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                {isUploading ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                        <p className="text-sm text-muted-foreground">Uploading...</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">
                                            Click or drag image here
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Max 5MB • JPG, PNG, GIF, WebP
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bio</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Tell us about yourself..."
                                            className="resize-none"
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <div className="text-xs text-muted-foreground text-right">
                                        {field.value?.length || 0}/160
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Location</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="City, Country"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="website"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Website</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="https://yourwebsite.com"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={updateProfile.isPending || isUploading}>
                                {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
