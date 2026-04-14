import api from "../utils/api";

// get all Offers To Company
export const getAllOffersToCompany = () => {
    return api.get("/offer/all/company");
};

// get all Offers To Applicant
export const getAllOffersToApplicant = () => {
    return api.get("/offer/all/applicant");
};


//send Response To Offer
export const sendResponseToOffer = (offerId: string, response: string) => {
    return api.patch(`/offer/response/${offerId}`, { status: response });
};