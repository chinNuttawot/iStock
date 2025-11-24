import { CardListModel } from "@/service/myInterface";

export function useFilterData({ data }: { data: CardListModel[]; }) {

    let _data = data;
    _data = _data.filter(
        (item: CardListModel) => item.status !== "Approved"
    );

    return _data || [];
}