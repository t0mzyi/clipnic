-- RPC for atomic payout processing to prevent race conditions
CREATE OR REPLACE FUNCTION process_user_payout(p_user_id UUID, p_admin_id UUID, p_notes TEXT)
RETURNS JSON AS $$
DECLARE
    v_total_amount DECIMAL;
    v_submission_ids UUID[];
    v_payout_id UUID;
BEGIN
    -- 1. Identify all eligible submissions for this user
    -- Logic: Verified, not Paid, not Rejected, and belongs to an ended/completed campaign
    SELECT 
        COALESCE(array_agg(s.id), ARRAY[]::UUID[]), 
        COALESCE(SUM(s.earnings), 0)
    INTO v_submission_ids, v_total_amount
    FROM submissions s
    JOIN campaigns c ON s.campaign_id = c.id
    WHERE s.user_id = p_user_id
      AND s.status = 'Verified'
      AND (c.status = 'Completed' OR c.end_date < NOW());

    IF v_total_amount = 0 OR array_length(v_submission_ids, 1) IS NULL THEN
        RAISE EXCEPTION 'No eligible submissions found for this user at this time.';
    END IF;

    -- 2. Update submissions to 'Paid'
    UPDATE submissions
    SET status = 'Paid', updated_at = NOW()
    WHERE id = ANY(v_submission_ids);

    -- 3. Insert payout record
    INSERT INTO payouts (user_id, admin_id, amount, submission_ids, notes, created_at)
    VALUES (p_user_id, p_admin_id, v_total_amount, v_submission_ids, p_notes, NOW())
    RETURNING id INTO v_payout_id;

    RETURN json_build_object(
        'id', v_payout_id,
        'amount', v_total_amount,
        'submission_ids', v_submission_ids
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
