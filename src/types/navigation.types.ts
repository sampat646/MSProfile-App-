// src/types/navigation.types.ts
import { NewsItem } from '../services/news.service';

export type RootStackParamList = {
  Home: undefined;
  NewsDetail: { newsItem: NewsItem };
  // Add other screens here as needed
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}