// Shared types for TMDB and TVDB responses

export interface TmdbSearchResult {
  page: number;
  results: TmdbMediaItem[];
  total_pages: number;
  total_results: number;
}

export interface TmdbMediaItem {
  adult: boolean;
  backdrop_path: string | null;
  id: number;
  media_type?: string;
  title?: string;
  original_title?: string;
  name?: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  genre_ids: number[];
  popularity: number;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  origin_country?: string[];
  original_language: string;
  video?: boolean;
  known_for_department?: string;
  profile_path?: string | null;
}

export interface TmdbMovieDetails {
  adult: boolean;
  backdrop_path: string | null;
  belongs_to_collection: TmdbCollection | null;
  budget: number;
  genres: TmdbGenre[];
  homepage: string;
  id: number;
  imdb_id: string | null;
  origin_country: string[];
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  production_companies: TmdbCompany[];
  production_countries: TmdbCountry[];
  release_date: string;
  revenue: number;
  runtime: number;
  spoken_languages: TmdbLanguage[];
  status: string;
  tagline: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

export interface TmdbTvDetails {
  adult: boolean;
  backdrop_path: string | null;
  created_by: TmdbCreator[];
  episode_run_time: number[];
  first_air_date: string;
  genres: TmdbGenre[];
  homepage: string;
  id: number;
  in_production: boolean;
  languages: string[];
  last_air_date: string;
  last_episode_to_air: TmdbEpisode | null;
  name: string;
  networks: TmdbNetwork[];
  number_of_episodes: number;
  number_of_seasons: number;
  origin_country: string[];
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  production_companies: TmdbCompany[];
  seasons: TmdbSeasonOverview[];
  status: string;
  tagline: string;
  type: string;
  vote_average: number;
  vote_count: number;
}

export interface TmdbSeasonDetails {
  _id: string;
  air_date: string;
  episodes: TmdbEpisode[];
  name: string;
  overview: string | null;
  id: number;
  poster_path: string | null;
  season_number: number;
  vote_average: number;
}

export interface TmdbEpisode {
  air_date: string;
  crew: TmdbCrew[];
  episode_number: number;
  episode_type?: string;
  guest_stars?: TmdbGuestStar[];
  name: string;
  overview: string;
  id: number;
  production_code: string;
  runtime: number | null;
  season_number: number;
  show_id?: number;
  still_path: string | null;
  vote_average: number;
  vote_count: number;
  [key: string]: unknown;
}

export interface TmdbTrendingResult {
  page: number;
  results: TmdbMediaItem[];
  total_pages: number;
  total_results: number;
}

export interface TmdbGenreList {
  genres: TmdbGenre[];
}

export interface TmdbGenre {
  id: number;
  name: string;
}

export interface TmdbCollection {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
}

export interface TmdbCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface TmdbCountry {
  iso_3166_1: string;
  name: string;
}

export interface TmdbLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface TmdbCreator {
  id: number;
  credit_id: string;
  name: string;
  gender: number;
  profile_path: string | null;
}

export interface TmdbNetwork {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface TmdbSeasonOverview {
  air_date: string;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  vote_average: number;
}

export interface TmdbCrew {
  department: string;
  job: string;
  name: string;
  id: number;
  credit_id?: string;
}

export interface TmdbGuestStar {
  character: string;
  name: string;
  id: number;
  profile_path: string | null;
  order?: number;
  credit_id?: string;
}

export interface TmdbConfigLanguage {
  iso_639_1: string;
  english_name: string;
  name: string;
}

// TVDB types

export interface TvdbLoginResponse {
  data: { token: string };
  status: string;
}

export interface TvdbSearchResult {
  data: TvdbSearchItem[];
  status: string;
}

export interface TvdbSearchItem {
  id: string;
  name: string;
  overview: string | null;
  poster: string | null;
  tvdb_id: string;
  type: string;
  year: string | null;
  remote_ids: TvdbRemoteId[];
}

export interface TvdbRemoteId {
  id: string;
  name: string;
  type: number;
}

export interface TvdbSeriesResponse {
  data: TvdbSeries;
  status: string;
}

export interface TvdbSeriesExtendedResponse {
  data: TvdbSeriesExtended;
  status: string;
}

export interface TvdbSeries {
  id: number;
  name: string;
  overview: string | null;
  score: number | null;
  status: TvdbStatus;
  year: string | null;
  firstAired: string | null;
  lastAired: string | null;
  image: string | null;
  aliases: TvdbAlias[];
  networks: TvdbNetwork[];
}

export interface TvdbStatus {
  id: number;
  name: string;
  recordType: string;
}

export interface TvdbAlias {
  name: string;
}

export interface TvdbNetwork {
  id: number;
  name: string;
  country: string;
}

export interface TvdbSeriesExtended extends TvdbSeries {
  seasons: TvdbSeason[];
  episodes: TvdbEpisode[];
  artworks: TvdbArtwork[];
  characters: TvdbCharacter[];
  genres: TvdbGenreItem[];
  companies: TvdbCompany[];
  remoteIds: TvdbRemoteId[];
  trailers: TvdbTrailer[];
}

export interface TvdbSeason {
  id: number;
  seriesId: number;
  name: string | null;
  number: number;
  type: { id: number; name: string; type: string };
  image: string | null;
  episodeCount: number;
}

export interface TvdbEpisode {
  id: number;
  seriesId: number;
  name: string | null;
  aired: string;
  runtime: number;
  seasonNumber: number;
  episodeNumber: number;
  image: string | null;
  overview: string | null;
  isMovie: number;
}

export interface TvdbArtwork {
  id: number;
  image: string;
  thumbnail: string;
  language: string | null;
  type: number;
  seasonId: number | null;
  score: number;
  width: number;
  height: number;
  updatedAt: string;
}

export interface TvdbCharacter {
  id: number;
  name: string;
  image: string | null;
  peopleId: number;
  personImgURL: string | null;
}

export interface TvdbGenreItem {
  id: number;
  name: string;
}

export interface TvdbCompany {
  id: number;
  name: string;
  primaryCompanyType: number;
}

export interface TvdbTrailer {
  id: number;
  name: string;
  url: string;
  language: string;
}

export interface TvdbEpisodesResponse {
  data: {
    episodes: TvdbEpisode[];
    series: TvdbSeries[];
  };
  status: string;
}

export interface TvdbRemoteIdResponse {
  data: TvdbRemoteIdItem[];
  status: string;
}

export interface TvdbRemoteIdItem {
  id: string;
  type: string;
  entityType?: string;
}

export interface TvdbSeasonTypesResponse {
  data: TvdbSeasonType[];
  status: string;
}

export interface TvdbSeasonType {
  id: number;
  typeId: number;
  name: string;
}

export interface TvdbUpdatesResponse {
  data: TvdbUpdateItem[];
  status: string;
}

export interface TvdbUpdateItem {
  id: number;
  method: string;
  extraInfo: string;
  createdAt: string;
}

export interface TvdbArtworkListResponse {
  data: TvdbSeriesArtwork[];
  status: string;
}

export interface TvdbSeriesArtwork {
  id: number;
  image: string;
  thumbnail: string;
  language: string | null;
  type: number;
  seasonId: number | null;
  score: number;
  width: number;
  height: number;
  updatedAt: string;
}
