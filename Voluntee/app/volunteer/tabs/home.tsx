import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ScrollView,
  Animated,
  TextInput,
  Keyboard,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { useRecommendedEvents } from "@/hooks/volunteer/home/useRecommendedEvents";
import type { VolunteerEvent } from "@/services/volunteer/home/volunteerHomeService";

const ACTIVE_BLUE = "#208AEF";

const CATEGORIES = ["All", "Environment", "Animals", "Social", "Community"] as const;

type CategoryId = (typeof CATEGORIES)[number];

const CATEGORY_THEME: Record<
  Exclude<CategoryId, "All">,
  { accent: string; labelHr: string }
> = {
  Environment: {
    accent: "#2D9D78",
    labelHr: "Okoliš",
  },
  Animals: {
    accent: "#C45C26",
    labelHr: "Životinje",
  },
  Social: {
    accent: "#7C5CE6",
    labelHr: "Društvo",
  },
  Community: {
    accent: ACTIVE_BLUE,
    labelHr: "Zajednica",
  },
};

function getCategoryTheme(category: string) {
  const key = category as Exclude<CategoryId, "All">;
  if (key in CATEGORY_THEME) return CATEGORY_THEME[key];
  return CATEGORY_THEME.Community;
}

type Opportunity = {
  id: string;
  description: string;
  location: string;
  hours: string;
  category: string;
  author: {
    kind: "organization" | "individual";
    name: string;
  };
};

function eventToOpportunity(e: VolunteerEvent): Opportunity {
  const hours = e.durationMinutes >= 60
    ? `${Math.round(e.durationMinutes / 60)} h`
    : `${e.durationMinutes} min`;

  return {
    id: e.id,
    description: e.title || e.description,
    location: e.address,
    hours,
    category: e.category || "Community",
    author: {
      kind: "organization",
      name: e.organizerName || "Unknown",
    },
  };
}

function authorInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0].charAt(0).toUpperCase();
    const b = parts[1].charAt(0).toUpperCase();
    return `${a}${b}`.slice(0, 2);
  }
  const w = parts[0] ?? "?";
  return w.slice(0, 2).toUpperCase();
}

function IconSearch({ size = 22, color = "#111" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function IconPin({ size = 14, color = "#888" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        stroke={color}
        strokeWidth={1.5}
      />
      <Path
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function IconClock({ size = 14, color = "#888" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 6v6l4 2m6-2a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function OpportunityCard({ item }: { item: Opportunity }) {
  const theme = getCategoryTheme(item.category);
  const metaIconColor = "#94a3b8";

  return (
    <View
      style={[
        styles.card,
        {
          borderColor: `${theme.accent}28`,
        },
      ]}
    >
      <View style={[styles.cardAccent, { backgroundColor: theme.accent }]} />

      <View style={styles.cardMain}>
        <View style={styles.cardBody}>
          <Text style={styles.description}>{item.description}</Text>
          <Text style={[styles.categoryLine, { color: theme.accent }]}>
            {theme.labelHr}
          </Text>
          <View style={styles.metaRow}>
            <IconPin color={metaIconColor} />
            <Text style={styles.metaText}>{item.location}</Text>
          </View>
          <View style={styles.metaRow}>
            <IconClock color={metaIconColor} />
            <Text style={styles.metaText}>{item.hours}</Text>
          </View>
          <View style={styles.authorRow}>
            <View style={styles.authorAvatar}>
              <Text style={styles.authorAvatarText}>
                {authorInitials(item.author.name)}
              </Text>
            </View>
            <View style={styles.authorTextCol}>
              <Text style={styles.authorKind}>
                {item.author.kind === "organization" ? "Organizacija" : "Privatni korisnik"}
              </Text>
              <Text style={styles.authorName} numberOfLines={2}>
                {item.author.name}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const SEARCH_PLACEHOLDER = "Search for organizations or jobs...";
const SEARCH_BAR_WIDTH_FRACTION = 0.9;

/** Ista brzina otvaranja i zatvaranja — umjereno, ne presporo. */
const SEARCH_SPRING = {
  friction: 11,
  tension: 64,
  useNativeDriver: false as boolean,
};

export default function VolunteerHome() {
  const { width: windowWidth } = useWindowDimensions();
  const contentWidth = Math.max(0, windowWidth - 40);
  const searchOpenWidth = Math.min(
    Math.round(contentWidth * SEARCH_BAR_WIDTH_FRACTION),
    Math.max(0, contentWidth - 38),
  );

  const { events: rawEvents, loading, error } = useRecommendedEvents();
  const opportunities = useMemo(
    () => rawEvents.map(eventToOpportunity),
    [rawEvents],
  );

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchBarMounted, setSearchBarMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<TextInput>(null);
  const searchWidthAnim = useRef(new Animated.Value(0)).current;

  const filtered = useMemo(() => {
    let list =
      selectedCategory === "All"
        ? opportunities
        : opportunities.filter((o) => o.category === selectedCategory);

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (o) =>
          o.author.name.toLowerCase().includes(q) ||
          o.description.toLowerCase().includes(q),
      );
    }
    return list;
  }, [selectedCategory, searchQuery, opportunities]);

  const openSearch = useCallback(() => {
    if (searchOpen || searchBarMounted) return;
    setSearchOpen(true);
    setSearchBarMounted(true);
  }, [searchOpen, searchBarMounted]);

  const snapSearchBarClosed = useCallback(() => {
    searchWidthAnim.stopAnimation();
    searchWidthAnim.setValue(0);
    setSearchQuery("");
    setSearchBarMounted(false);
  }, [searchWidthAnim]);

  const closeSearch = useCallback(() => {
    if (!searchOpen) return;
    Keyboard.dismiss();
    searchInputRef.current?.blur();
    setSearchOpen(false);
    setSearchQuery("");
    Animated.spring(searchWidthAnim, {
      toValue: 0,
      ...SEARCH_SPRING,
    }).start(({ finished }) => {
      if (finished) {
        searchWidthAnim.setValue(0);
        setSearchBarMounted(false);
      }
    });
  }, [searchOpen, searchWidthAnim]);

  const handleOutsideSearch = useCallback(() => {
    if (searchOpen) closeSearch();
    else if (searchBarMounted) snapSearchBarClosed();
  }, [searchOpen, searchBarMounted, closeSearch, snapSearchBarClosed]);

  useLayoutEffect(() => {
    if (!searchOpen) return;
    searchWidthAnim.setValue(0);
    const id = requestAnimationFrame(() => {
      Animated.spring(searchWidthAnim, {
        toValue: searchOpenWidth,
        ...SEARCH_SPRING,
      }).start(() => {
        searchInputRef.current?.focus();
      });
    });
    return () => cancelAnimationFrame(id);
  }, [searchOpen, searchOpenWidth, searchWidthAnim]);

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={ACTIVE_BLUE} style={{ marginTop: 40 }} />
          ) : error ? (
            <Text style={styles.emptyText}>Failed to load events.</Text>
          ) : (
            <Text style={styles.emptyText}>No upcoming events found.</Text>
          )
        }
        onScrollBeginDrag={() => {
          if (searchOpen || searchBarMounted) handleOutsideSearch();
        }}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View style={styles.headerRow}>
                {!searchOpen ? (
                  searchBarMounted ? (
                    <Pressable
                      onPress={handleOutsideSearch}
                      hitSlop={10}
                      accessibilityRole="button"
                      accessibilityLabel="Voluntee"
                    >
                      <Text style={styles.brand}>Voluntee</Text>
                    </Pressable>
                  ) : (
                    <Text style={styles.brand}>Voluntee</Text>
                  )
                ) : null}
                <View style={styles.headerTrailing}>
                  {searchBarMounted ? (
                    <Animated.View
                      style={[
                        styles.searchField,
                        !searchOpen && styles.searchFieldClosing,
                        { width: searchWidthAnim },
                      ]}
                    >
                      {searchOpen ? (
                        <TextInput
                          ref={searchInputRef}
                          style={styles.searchInput}
                          value={searchQuery}
                          onChangeText={setSearchQuery}
                          placeholder={SEARCH_PLACEHOLDER}
                          placeholderTextColor="#9ca3af"
                          returnKeyType="search"
                          autoCorrect={false}
                          autoCapitalize="none"
                        />
                      ) : null}
                    </Animated.View>
                  ) : null}
                  <Pressable
                    style={styles.searchIconBtn}
                    hitSlop={8}
                    onPress={() => {
                      if (searchOpen) closeSearch();
                      else if (!searchBarMounted) openSearch();
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={
                      searchOpen ? "Close search" : "Search"
                    }
                  >
                    <IconSearch />
                  </Pressable>
                </View>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {CATEGORIES.map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => {
                      if (searchOpen || searchBarMounted) handleOutsideSearch();
                      setSelectedCategory(cat);
                    }}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </>
        }
        renderItem={({ item }) => (
          <Pressable
            onPressIn={() => {
              if (searchOpen || searchBarMounted) handleOutsideSearch();
            }}
          >
            <OpportunityCard item={item} />
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fff",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 8,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 6,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    minHeight: 44,
  },
  headerTrailing: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  brand: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111",
    letterSpacing: -0.3,
  },
  /** Samo lupe — bez obruba (obrub je samo na `searchField`). Krajnje desno. */
  searchIconBtn: {
    padding: 6,
    marginLeft: 2,
  },
  searchField: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    marginRight: 6,
    paddingLeft: 12,
    paddingRight: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.12)",
    backgroundColor: "#fff",
    overflow: "hidden",
    ...Platform.select({
      android: { elevation: 2 },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 2,
      },
    }),
  },
  /** Bez obruba/sjene/pozadine dok se traka sužava — vizualno u ikonu. */
  searchFieldClosing: {
    borderWidth: 0,
    backgroundColor: "transparent",
    ...Platform.select({
      android: { elevation: 0 },
      default: {
        shadowOpacity: 0,
        shadowRadius: 0,
      },
    }),
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    color: "#111",
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
    paddingRight: 10,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 0,
    paddingBottom: 12,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#F0F0F0",
  },
  chipActive: {
    backgroundColor: "#111",
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  chipTextActive: {
    color: "#fff",
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    fontSize: 15,
    marginTop: 40,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  cardAccent: {
    width: 5,
    alignSelf: "stretch",
  },
  cardMain: {
    flex: 1,
    minWidth: 0,
  },
  cardBody: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 8,
    minWidth: 0,
  },
  description: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    lineHeight: 23,
    letterSpacing: -0.2,
  },
  categoryLine: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: "#555",
    flex: 1,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 2,
    paddingVertical: 4,
  },
  authorAvatar: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#ECEEF2",
    alignItems: "center",
    justifyContent: "center",
  },
  authorAvatarText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6b7280",
    letterSpacing: -0.2,
  },
  authorTextCol: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  authorKind: {
    fontSize: 10,
    fontWeight: "600",
    color: "#9ca3af",
    letterSpacing: 0.2,
  },
  authorName: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6b7280",
    lineHeight: 16,
  },
});
