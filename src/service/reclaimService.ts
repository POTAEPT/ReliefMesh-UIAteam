import { ReclaimProofRequest } from "@reclaimprotocol/js-sdk";
 
type OnSuccessCallback = (proofs: any) => void
type OnErrorCallback = (error: any) => void // แก้จาก OnErroe เป็น OnError

export const initializeReclaimSession = async(
    onSuccess: OnSuccessCallback,
    onError: OnErrorCallback
): Promise<string> => {
    // ⚠️ แก้คำผิดตรงนี้สำคัญมากครับ ไม่งั้นจะ Connect ไม่ได้
    // แนะนำให้เช็คในไฟล์ .env ด้วยว่าเขียนตรงกันไหม
    const APP_ID = import.meta.env.VITE_RECLAIM_APP_ID     // แก้ RECAIM -> RECLAIM_APP
    const APP_SECRET = import.meta.env.VITE_RECLAIM_APP_SECRET // แก้ RECLAM -> RECLAIM
    const PROVIDER_ID = import.meta.env.VITE_RECLAIM_PROVIDER_ID // แก้ RECLAM -> RECLAIM

    try{
        const reclaimClient = await ReclaimProofRequest.init(APP_ID, APP_SECRET, PROVIDER_ID)
        const url = await reclaimClient.getRequestUrl()

        reclaimClient.startSession({
            onSuccess: (proofs) => onSuccess(proofs),
            onError: (error) => onError(error),
        })

        return url
    }catch(error){
        console.error("Service: Error", error)
        throw error
    }
}