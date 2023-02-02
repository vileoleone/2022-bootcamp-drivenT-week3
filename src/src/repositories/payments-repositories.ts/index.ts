import { prisma } from "@/config";
import { data } from "@/protocols";

async function findPaymentByTicketiD(id: number) {
  return prisma.payment.findFirst({
    where: {
      ticketId: id
    }
  });
}

async function createPaymentRepository(paymentData: data) {
  return prisma.payment.create({
    data: paymentData
  });
}

const paymentsepository = {
  findPaymentByTicketiD,
  createPaymentRepository
};

export default paymentsepository;
