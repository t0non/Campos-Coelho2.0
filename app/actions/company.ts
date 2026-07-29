// ============================================================
// Actions para Cadastro Empresarial (Server Actions)
// ============================================================
'use server'

import {
  saveClientCompanyData,
  resubmitCompanyForReview as resubmitService,
  getDocumentSignedUrl as getSignedUrlService,
  approveCompanyAdmin as approveService,
  rejectCompanyAdmin as rejectService,
  suspendCompanyAdmin as suspendService,
  reactivateCompanyAdmin as reactivateService,
  assignSellerAdmin as assignSellerService,
  SaveCompanyDataInput,
} from '@/lib/services/company-service'

export async function saveCompanyAction(input: SaveCompanyDataInput) {
  return await saveClientCompanyData(input)
}

export async function resubmitCompanyAction() {
  return await resubmitService()
}

export async function getDocumentSignedUrlAction(filePath: string, expiresInSeconds: number = 3600) {
  return await getSignedUrlService(filePath, expiresInSeconds)
}

export async function approveCompanyAction(companyId: string, internalNotes?: string) {
  return await approveService(companyId, internalNotes)
}

export async function rejectCompanyAction(companyId: string, rejectionReason: string, internalNotes?: string) {
  return await rejectService(companyId, rejectionReason, internalNotes)
}

export async function suspendCompanyAction(companyId: string, reason: string) {
  return await suspendService(companyId, reason)
}

export async function reactivateCompanyAction(companyId: string, internalNotes?: string) {
  return await reactivateService(companyId, internalNotes)
}

export async function assignSellerAction(companyId: string, sellerId: string | null) {
  return await assignSellerService(companyId, sellerId)
}
