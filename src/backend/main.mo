import Map "mo:core/Map";
import Array "mo:core/Array";
import List "mo:core/List";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Order "mo:core/Order";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  let auditLogs = Map.empty<Text, AuditLog>();
  let highRiskCohorts = Map.empty<Text, HighRiskCohort>();
  let screeningWorkflows = Map.empty<Text, ScreeningWorkflow>();
  let p4iResults = Map.empty<Text, RatingEngineResult>();

  type RatingEngineResult = {
    id : Text;
    providerId : Text;
    quarter : Text;
    indicatorRatings : [RatingEngineIndicatorItem];
    domainScores : RatingEngineDomainScores;
    overallScore : Float;
    overallStars : Nat;
    incentiveEligibility : RatingEngineIncentiveEligibility;
    calculatedAt : Int;
    previousOverallStars : Nat;
    auditNotes : Text;
  };

  type IndicatorSubmissionRecord = {
    indicatorCode : Text;
    indicatorName : Text;
    domain : Text;
    rate : Float;
    benchmark : Float;
    quintile : Nat;
    trend : Text;
    screeningCompletion : Float;
  };

  type ProviderIndicatorSubmission = {
    id : Text;
    providerId : Text;
    quarter : Text;
    submittedAt : Int;
    indicators : [IndicatorSubmissionRecord];
    screeningBundleCompletion : Float;
    previousSafetyScore : Float;
  };

  type RatingEngineIndicatorItem = {
    indicatorCode : Text;
    indicatorName : Text;
    domain : Text;
    starRating : Float;
    trendAdjustment : Float;
    rate : Float;
    benchmark : Float;
    quintile : Nat;
    trend : Text;
  };

  type RatingEngineDomainScores = {
    safety : Float;
    preventive : Float;
    quality : Float;
    staffing : Float;
    compliance : Float;
    experience : Float;
  };

  type RatingEngineIncentiveEligibility = {
    tier : Text;
    eligible : Bool;
    estimatedPayment : Float;
    improvementScore : Float;
    screeningCompletion : Float;
  };

  type IndicatorResult = {
    id : Text;
    providerId : Text;
    quarter : Text;
    dimension : Text;
    indicatorCode : Text;
    indicatorName : Text;
    rate : Float;
    quintileRank : Nat;
    nationalBenchmark : Float;
    trend : Text;
  };

  module IndicatorResult {
    public func compare(a : IndicatorResult, b : IndicatorResult) : Order.Order {
      Text.compare(a.id, b.id);
    };
  };

  type ProviderScorecard = {
    id : Text;
    providerId : Text;
    quarter : Text;
    overallScore : Float;
    safetyScore : Float;
    preventiveScore : Float;
    experienceScore : Float;
    equityScore : Float;
    quintileRank : Nat;
  };

  module ProviderScorecard {
    public func compare(a : ProviderScorecard, b : ProviderScorecard) : Order.Order {
      Text.compare(a.id, b.id);
    };
  };

  type HighRiskCohort = {
    id : Text;
    providerId : Text;
    riskCriteria : Text;
    cohortSize : Nat;
    flagDate : Int;
    status : Text;
    urgency : Text;
  };

  module HighRiskCohort {
    public func compare(a : HighRiskCohort, b : HighRiskCohort) : Order.Order {
      Text.compare(a.id, b.id);
    };

    public func compareByProviderId(a : HighRiskCohort, b : HighRiskCohort) : Order.Order {
      Text.compare(a.providerId, b.providerId);
    };
  };

  type ScreeningWorkflow = {
    id : Text;
    providerId : Text;
    screeningType : Text;
    dueDate : Int;
    status : Text;
    completionTimeHours : Float;
  };

  module ScreeningWorkflow {
    public func compare(a : ScreeningWorkflow, b : ScreeningWorkflow) : Order.Order {
      Text.compare(a.id, b.id);
    };

    public func compareByProviderId(a : ScreeningWorkflow, b : ScreeningWorkflow) : Order.Order {
      Text.compare(a.providerId, b.providerId);
    };
  };

  type PayForImprovement = {
    id : Text;
    providerId : Text;
    quarter : Text;
    metricType : Text;
    baselineValue : Float;
    currentValue : Float;
    improvementPct : Float;
    fundingEligible : Bool;
    fundingAmount : Float;
  };

  module PayForImprovement {
    public func compare(a : PayForImprovement, b : PayForImprovement) : Order.Order {
      Text.compare(a.id, b.id);
    };
  };

  type DataIngestionRecord = {
    id : Text;
    providerId : Text;
    quarter : Text;
    submissionType : Text;
    recordCount : Nat;
    validationErrors : Nat;
    dataQualityScore : Float;
    processingStatus : Text;
  };

  module DataIngestionRecord {
    public func compare(a : DataIngestionRecord, b : DataIngestionRecord) : Order.Order {
      Text.compare(a.id, b.id);
    };
  };

  type AuditLog = {
    id : Text;
    userId : Text;
    userRole : Text;
    action : Text;
    entityType : Text;
    timestamp : Int;
    details : Text;
  };

  module AuditLog {
    public func compare(a : AuditLog, b : AuditLog) : Order.Order {
      Text.compare(a.id, b.id);
    };
  };

  type RegionalAggregate = {
    id : Text;
    state : Text;
    region : Text;
    quarter : Text;
    totalProviders : Nat;
    avgSafetyScore : Float;
    screeningComplianceRate : Float;
    highRiskPrevalence : Float;
  };

  type NationalOverviewStats = {
    totalProviders : Nat;
    totalResidents : Nat;
    avgSafetyScore : Float;
    avgPreventiveScore : Float;
    screeningComplianceRate : Float;
    highRiskFlagged : Nat;
    dataQualityScore : Float;
  };

  func quintileToStars(quintile : Nat) : Float {
    switch (quintile) {
      case (1) { 5.0 };
      case (2) { 4.0 };
      case (3) { 3.0 };
      case (4) { 2.0 };
      case (5) { 1.0 };
      case (_) { 3.0 };
    };
  };

  func trendAdjustment(trend : Text) : Float {
    if (Text.equal(trend, "improving")) { 0.2 } else if (Text.equal(trend, "declining")) { -0.2 } else {
      0.0;
    };
  };

  func clampRating(rating : Float) : Float {
    if (rating < 1.0) { 1.0 } else if (rating > 5.0) { 5.0 } else { rating };
  };

  func calculateDomainScore(indicators : [Float]) : Float {
    if (indicators.size() == 0) { 3.0 } else {
      let sum = indicators.foldLeft(0.0, func(acc, rating) { acc + rating });
      sum / indicators.size().toFloat();
    };
  };

  func calculateOverallScore(scores : RatingEngineDomainScores) : Float {
    (scores.safety * 0.30) +
    (scores.preventive * 0.20) +
    (scores.quality * 0.20) +
    (scores.staffing * 0.15) +
    (scores.compliance * 0.10) +
    (scores.experience * 0.05);
  };

  func mapScoreToStars(score : Float) : Nat {
    if (score >= 4.5) { 5 } else if (score >= 3.5) { 4 } else if (score >= 2.5) { 3 } else if (score >= 1.5) { 2 } else {
      1;
    };
  };

  func calculateIncentiveEligibility(
    overallStars : Nat,
    safetyImprovementPct : Float,
    screeningCompletion : Float,
  ) : RatingEngineIncentiveEligibility {
    if (overallStars >= 4 and safetyImprovementPct >= 10.0 and screeningCompletion >= 85.0) {
      {
        tier = "Maximum Eligible";
        eligible = true;
        estimatedPayment = 180000.0;
        improvementScore = (safetyImprovementPct * 0.5) + (screeningCompletion * 0.5);
        screeningCompletion;
      };
    } else if (overallStars >= 4 and safetyImprovementPct >= 10.0) {
      {
        tier = "Bonus Eligible";
        eligible = true;
        estimatedPayment = 120000.0;
        improvementScore = (safetyImprovementPct * 0.5) + (screeningCompletion * 0.5);
        screeningCompletion;
      };
    } else if (overallStars >= 4) {
      {
        tier = "Base Eligible";
        eligible = true;
        estimatedPayment = 75000.0;
        improvementScore = (safetyImprovementPct * 0.5) + (screeningCompletion * 0.5);
        screeningCompletion;
      };
    } else {
      {
        tier = "Not Eligible";
        eligible = false;
        estimatedPayment = 0.0;
        improvementScore = (safetyImprovementPct * 0.5) + (screeningCompletion * 0.5);
        screeningCompletion;
      };
    };
  };

  public shared ({ caller }) func submitIndicatorData(
    submission : ProviderIndicatorSubmission
  ) : async RatingEngineResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    let indicatorsList = List.empty<RatingEngineIndicatorItem>();

    let indicators = submission.indicators;
    for (ind in indicators.values()) {
      let stars = clampRating(quintileToStars(ind.quintile) + trendAdjustment(ind.trend));
      let newItem : RatingEngineIndicatorItem = {
        ind with
        starRating = stars;
        trendAdjustment = trendAdjustment(ind.trend);
      };
      indicatorsList.add(newItem);
    };

    let safetyScores = indicatorsList.values().filter(func(r) { Text.equal(r.domain, "Safety") }).map(func(r) { r.starRating }).toArray();
    let preventiveScores = indicatorsList.values().filter(func(r) { Text.equal(r.domain, "Preventive") }).map(func(r) { r.starRating }).toArray();
    let qualityScores = indicatorsList.values().filter(func(r) { Text.equal(r.domain, "Quality") }).map(func(r) { r.starRating }).toArray();
    let staffingScores = indicatorsList.values().filter(func(r) { Text.equal(r.domain, "Staffing") }).map(func(r) { r.starRating }).toArray();
    let complianceScores = indicatorsList.values().filter(func(r) { Text.equal(r.domain, "Compliance") }).map(func(r) { r.starRating }).toArray();
    let experienceScores = indicatorsList.values().filter(func(r) { Text.equal(r.domain, "Experience") }).map(func(r) { r.starRating }).toArray();

    let domainScores : RatingEngineDomainScores = {
      safety = calculateDomainScore(safetyScores);
      preventive = calculateDomainScore(preventiveScores);
      quality = calculateDomainScore(qualityScores);
      staffing = calculateDomainScore(staffingScores);
      compliance = calculateDomainScore(complianceScores);
      experience = calculateDomainScore(experienceScores);
    };

    let overallScore = calculateOverallScore(domainScores);
    let overallStars = mapScoreToStars(overallScore);
    let incentive = calculateIncentiveEligibility(overallStars, submission.previousSafetyScore, submission.screeningBundleCompletion);

    let result : RatingEngineResult = {
      id = submission.id;
      providerId = submission.providerId;
      quarter = submission.quarter;
      indicatorRatings = indicatorsList.toArray();
      domainScores;
      overallScore;
      overallStars;
      incentiveEligibility = incentive;
      calculatedAt = Time.now();
      previousOverallStars = 0;
      auditNotes = "";
    };

    p4iResults.add(submission.id, result);

    let newLog : AuditLog = {
      id = Time.now().toText();
      userId = caller.toText();
      userRole = "user";
      action = "Submitted Indicator Data";
      entityType = "RatingEngineResult";
      timestamp = Time.now();
      details = "Indicator data submitted for " # submission.id;
    };

    auditLogs.add(newLog.id, newLog);

    result;
  };

  public query ({ caller }) func getRatingEngineResult(providerId : Text, quarter : Text) : async ?RatingEngineResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    let resultsArray = p4iResults.values().filter(
      func(result) {
        result.providerId == providerId and result.quarter == quarter
      }
    ).toArray();
    if (resultsArray.size() > 0) { ?resultsArray[0] } else { null };
  };

  public query ({ caller }) func getAllRatingEngineResults(quarter : Text) : async [RatingEngineResult] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    let filtered = p4iResults.values().filter(func(result) { result.quarter == quarter }).toArray();
    filtered;
  };

  public query ({ caller }) func getProviderScorecardV2(providerId : Text, quarter : Text) : async ?RatingEngineResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    let resultsArray = p4iResults.values().filter(
      func(result) {
        result.providerId == providerId and result.quarter == quarter
      }
    ).toArray();
    if (resultsArray.size() > 0) { ?resultsArray[0] } else { null };
  };

  public query ({ caller }) func getIndicatorResults(providerId : Text, quarter : Text) : async [IndicatorResult] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    let allResults : [IndicatorResult] = [
      {
        id = "ind_001";
        providerId = "prov_001";
        quarter = "Q1-2024";
        dimension = "Safety";
        indicatorCode = "PRT";
        indicatorName = "Pressure Ulcers";
        rate = 1.5;
        quintileRank = 1;
        nationalBenchmark = 3.2;
        trend = "Improved";
      },
      {
        id = "ind_002";
        providerId = "prov_001";
        quarter = "Q1-2024";
        dimension = "Safety";
        indicatorCode = "MRSA";
        indicatorName = "Infections";
        rate = 0.8;
        quintileRank = 2;
        nationalBenchmark = 1.5;
        trend = "Stable";
      },
      {
        id = "ind_003";
        providerId = "prov_002";
        quarter = "Q1-2024";
        dimension = "Safety";
        indicatorCode = "PRT";
        indicatorName = "Pressure Ulcers";
        rate = 2.2;
        quintileRank = 3;
        nationalBenchmark = 3.2;
        trend = "Improved";
      },
    ];
    allResults.filter(
      func(result) {
        result.providerId == providerId and result.quarter == quarter
      }
    );
  };

  public query ({ caller }) func getScorecardsByProvider(providerId : Text) : async [ProviderScorecard] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    let allScorecards : [ProviderScorecard] = [
      {
        id = "sc1";
        providerId = "prov_001";
        quarter = "Q1-2024";
        overallScore = 86.5;
        safetyScore = 88.2;
        preventiveScore = 85.4;
        experienceScore = 84.6;
        equityScore = 88.7;
        quintileRank = 1;
      },
      {
        id = "sc2";
        providerId = "prov_002";
        quarter = "Q1-2024";
        overallScore = 77.5;
        safetyScore = 79.4;
        preventiveScore = 76.3;
        experienceScore = 75.9;
        equityScore = 70.8;
        quintileRank = 2;
      },
    ];
    allScorecards.filter(func(sc) { sc.providerId == providerId });
  };

  public query ({ caller }) func getNationalOverviewStats(_quarter : Text) : async NationalOverviewStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    {
      totalProviders = 10;
      totalResidents = 2000;
      avgSafetyScore = 80.2;
      avgPreventiveScore = 78.5;
      screeningComplianceRate = 82.1;
      highRiskFlagged = 85;
      dataQualityScore = 90.4;
    };
  };

  public query ({ caller }) func getAllHighRiskCohorts() : async [HighRiskCohort] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    let cohortValues = highRiskCohorts.values().toArray();
    cohortValues.sort();
  };

  public query ({ caller }) func getAllScreeningWorkflows() : async [ScreeningWorkflow] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    let workflowValues = screeningWorkflows.values().toArray();
    workflowValues.sort();
  };

  public query ({ caller }) func getAuditLogs() : async [AuditLog] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let values = auditLogs.values().toArray();
    values.sort();
  };

  public shared ({ caller }) func addAuditLogEntry(userId : Text, userRole : Text, action : Text, entityType : Text, details : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    let newLog : AuditLog = {
      id = Time.now().toText();
      userId;
      userRole;
      action;
      entityType;
      timestamp = Time.now();
      details;
    };
    auditLogs.add(newLog.id, newLog);
  };

  public shared ({ caller }) func updateScreeningStatus(workflowId : Text, status : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    switch (screeningWorkflows.get(workflowId)) {
      case (null) { Runtime.trap("Workflow does not exist") };
      case (?workflow) {
        let updatedWorkflow : ScreeningWorkflow = {
          workflow with
          status
        };
        screeningWorkflows.add(workflowId, updatedWorkflow);
      };
    };
  };

  public query ({ caller }) func getHighRiskCohorts(providerId : Text) : async [HighRiskCohort] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    highRiskCohorts.values().filter(func(c) { c.providerId == providerId }).toArray().sort(HighRiskCohort.compareByProviderId);
  };

  public query ({ caller }) func getScreeningWorkflows(providerId : Text) : async [ScreeningWorkflow] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    screeningWorkflows.values().filter(func(w) { w.providerId == providerId }).toArray().sort(ScreeningWorkflow.compareByProviderId);
  };

  // ======== START OF BOOKING AND RATING SYSTEM ========

  let bookings = Map.empty<Text, Booking>();
  let publicRatings = Map.empty<Text, PublicRating>();

  public type Booking = {
    id : Text;
    userId : Text;
    providerId : Text;
    providerName : Text;
    userName : Text;
    userPhone : Text;
    service : Text;
    date : Text;
    time : Text;
    address : Text;
    confirmationNumber : Text;
    status : Text;
    feedbackSubmitted : Bool;
  };

  public type PublicRating = {
    id : Text;
    bookingId : Text;
    userId : Text;
    providerId : Text;
    overallRating : Float;
    safetyRating : Float;
    qualityRating : Float;
    experienceRating : Float;
    preventiveRating : Float;
    feedbackText : Text;
    submittedAt : Int;
    status : Text;
  };

  module PublicRating {
    public func compare(a : PublicRating, b : PublicRating) : Order.Order {
      Text.compare(a.id, b.id);
    };

    public func compareByProviderId(a : PublicRating, b : PublicRating) : Order.Order {
      Text.compare(a.providerId, b.providerId);
    };
  };

  public type PublicRatingAggregate = {
    overallAverage : Float;
    safetyAverage : Float;
    qualityAverage : Float;
    experienceAverage : Float;
    preventiveAverage : Float;
    count : Nat;
  };

  public shared ({ caller }) func createBooking(booking : Booking) : async Text {
    // Verify caller owns the userId in the booking
    let callerText = caller.toText();
    if (booking.userId != callerText and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only create bookings for yourself");
    };
    bookings.add(booking.id, booking);
    booking.confirmationNumber;
  };

  public query ({ caller }) func getUserBookings(userId : Text) : async [Booking] {
    // Verify caller can only see their own bookings (or admin can see all)
    let callerText = caller.toText();
    if (userId != callerText and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own bookings");
    };
    bookings.values().filter(func(b) { b.userId == userId }).toArray();
  };

  public shared ({ caller }) func updateBookingStatus(id : Text, status : Text) : async Bool {
    switch (bookings.get(id)) {
      case (null) { false };
      case (?booking) {
        // Verify caller owns the booking
        let callerText = caller.toText();
        if (booking.userId != callerText and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own bookings");
        };
        bookings.add(
          id,
          {
            booking with
            status
          },
        );
        true;
      };
    };
  };

  public shared ({ caller }) func markBookingComplete(id : Text) : async Bool {
    switch (bookings.get(id)) {
      case (null) { false };
      case (?booking) {
        // Verify caller owns the booking
        let callerText = caller.toText();
        if (booking.userId != callerText and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own bookings");
        };
        bookings.add(
          id,
          {
            booking with
            status = "Completed";
          },
        );
        true;
      };
    };
  };

  public query ({ caller }) func getProviderBookings(providerId : Text) : async [Booking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    bookings.values().filter(func(b) { b.providerId == providerId }).toArray();
  };

  public query ({ caller }) func getBookingById(id : Text) : async ?Booking {
    switch (bookings.get(id)) {
      case (null) { null };
      case (?booking) {
        // Verify caller owns the booking or is admin
        let callerText = caller.toText();
        if (booking.userId != callerText and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own bookings");
        };
        ?booking;
      };
    };
  };

  public shared ({ caller }) func submitPublicRating(rating : PublicRating) : async Bool {
    // Verify caller owns the userId in the rating
    let callerText = caller.toText();
    if (rating.userId != callerText and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only submit ratings for yourself");
    };

    if (publicRatings.get(rating.bookingId) != null) {
      Runtime.trap("Rating already submitted for this booking");
    };

    switch (bookings.get(rating.bookingId)) {
      case (null) { Runtime.trap("Booking does not exist") };
      case (?booking) {
        // Verify the booking belongs to the caller
        if (booking.userId != callerText and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only rate your own bookings");
        };
        if (not Text.equal(booking.status, "Completed")) {
          Runtime.trap("Booking must be completed to submit a rating");
        };
        publicRatings.add(rating.bookingId, rating);
        bookings.add(
          rating.bookingId,
          {
            booking with
            feedbackSubmitted = true;
          },
        );
        true;
      };
    };
  };

  public query ({ caller }) func getProviderPublicRatings(providerId : Text) : async [PublicRating] {
    // Public read - anyone can view provider ratings
    publicRatings.values().filter(func(r) { r.providerId == providerId }).toArray();
  };

  public query ({ caller }) func getPublicRatingAverage(providerId : Text) : async PublicRatingAggregate {
    // Public read - anyone can view provider rating averages
    var overallSum = 0.0;
    var safetySum = 0.0;
    var qualitySum = 0.0;
    var experienceSum = 0.0;
    var preventiveSum = 0.0;
    var count = 0;

    for (rating in publicRatings.values()) {
      if (Text.equal(rating.providerId, providerId)) {
        overallSum += rating.overallRating;
        safetySum += rating.safetyRating;
        qualitySum += rating.qualityRating;
        experienceSum += rating.experienceRating;
        preventiveSum += rating.preventiveRating;
        count += 1;
      };
    };

    {
      overallAverage = if (count == 0) { 0.0 } else { overallSum / count.toFloat() };
      safetyAverage = if (count == 0) { 0.0 } else { safetySum / count.toFloat() };
      qualityAverage = if (count == 0) { 0.0 } else { qualitySum / count.toFloat() };
      experienceAverage = if (count == 0) { 0.0 } else { experienceSum / count.toFloat() };
      preventiveAverage = if (count == 0) { 0.0 } else { preventiveSum / count.toFloat() };
      count;
    };
  };

  public query ({ caller }) func getAllPublicBookings() : async [Booking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access all bookings");
    };
    bookings.values().toArray();
  };

  public query ({ caller }) func getAllPublicRatings() : async [PublicRating] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access all ratings");
    };
    publicRatings.values().toArray();
  };

  public shared ({ caller }) func deletePublicBooking(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete bookings");
    };
    bookings.remove(id);
  };

  public shared ({ caller }) func deletePublicRating(bookingId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete ratings");
    };
    publicRatings.remove(bookingId);
  };
};
