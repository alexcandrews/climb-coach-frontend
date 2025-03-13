-- Create coaching_insights table
CREATE TABLE IF NOT EXISTS coaching_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    timestamp FLOAT NOT NULL,
    insight_type TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE coaching_insights ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view coaching insights for their videos" 
    ON coaching_insights FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM videos 
        WHERE videos.id = coaching_insights.video_id 
        AND videos.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert coaching insights for their videos" 
    ON coaching_insights FOR INSERT 
    WITH CHECK (EXISTS (
        SELECT 1 FROM videos 
        WHERE videos.id = coaching_insights.video_id 
        AND videos.user_id = auth.uid()
    ));

CREATE POLICY "Users can update coaching insights for their videos" 
    ON coaching_insights FOR UPDATE 
    USING (EXISTS (
        SELECT 1 FROM videos 
        WHERE videos.id = coaching_insights.video_id 
        AND videos.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete coaching insights for their videos" 
    ON coaching_insights FOR DELETE 
    USING (EXISTS (
        SELECT 1 FROM videos 
        WHERE videos.id = coaching_insights.video_id 
        AND videos.user_id = auth.uid()
    ));

-- Create updated_at trigger
CREATE TRIGGER update_coaching_insights_updated_at
    BEFORE UPDATE ON coaching_insights
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 