'use server';

import * as z from 'zod';

const serviceRequestSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    organization: z.string().optional(),
    service: z.string(),
    message: z.string().min(10),
});

export async function handleServiceRequest(values: z.infer<typeof serviceRequestSchema>) {
    const validatedFields = serviceRequestSchema.safeParse(values);
  
    if (!validatedFields.success) {
      return { success: false, message: 'Invalid data provided.' };
    }
    
    // Simulate API call/database operation
    console.log('New service request:', validatedFields.data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true, message: 'Service request sent successfully.' };
  }
