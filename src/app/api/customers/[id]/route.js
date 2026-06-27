import { fail, ok } from "@/lib/api/responses";
import { prisma } from "@/lib/prisma";

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const customer = await prisma.customer.findUnique({
      where: { id },
      select: {
        firstName: true,
        lastName: true,
      },
    });

    if (!customer) {
      return fail("Customer not found.", 404);
    }

    return ok({
      id,
      fullName: `${customer.firstName} ${customer.lastName}`,
    });
  } catch (error) {
    console.error(error);
    return fail("Unable to load customer summary.", 500);
  }
}
