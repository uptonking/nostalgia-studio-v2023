import API from './APIUtils';
import mockApi from './mockApi';

type Tags = {
  tags: string[];
};

export function getTags() {
  // return API.get<Tags>('/tags');

  return mockApi.getTags();
}
