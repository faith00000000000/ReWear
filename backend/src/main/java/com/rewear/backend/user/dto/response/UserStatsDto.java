package com.rewear.backend.user.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStatsDto {
    private long listingsPosted;
    private long activeItems;
    private long soldOrRented;
    // savedByUsers deliberately omitted — no backend data source exists yet
    // (favorites are localStorage-only on the frontend). Add this field only
    // once a real Favorite entity is built; don't stub it with 0 in the
    // meantime, since 0 there would look like "nobody saved this" rather
    // than "not tracked."
}