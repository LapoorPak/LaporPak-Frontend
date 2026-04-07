import { useQueryGetAgencyLocations } from "@/api/agencies/agencies-queries";

export const useGetAgencyLocations = () => {
  const query = useQueryGetAgencyLocations();
  
  return query;
};
