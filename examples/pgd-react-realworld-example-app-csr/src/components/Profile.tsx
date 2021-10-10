import * as React from 'react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import {
  Button,
  Flex,
  Form,
  Grid,
  Heading,
  Image,
  Text,
  TextField,
  View,
} from '@adobe/react-spectrum';

import { followProfile, getProfile, unfollowProfile } from '../api/ProfileAPI';
import useAuth from '../context/auth';
import { IProfile } from '../types';
import { ALT_IMAGE_URL } from '../utils';
import ProfileArticles from './ProfileArticles';
import FollowUserButton from './common/FollowUserButton';

export default function Profile() {
  const { username } = useParams();
  console.log('Profile-username, ', username);
  const [profile, setProfile] = useState<IProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const {
    state: { user },
  } = useAuth();

  useEffect(() => {
    let ignore = false;

    async function fetchProfile() {
      try {
        const payload = await getProfile(username);
        // console.log('==profile-payload, ', JSON.stringify(payload));
        if (!ignore) {
          setProfile((payload as any).data.profile);
        }
      } catch (error) {
        console.log(error);
      }
    }

    fetchProfile();
    return () => {
      ignore = true;
    };
  }, [username]);

  const handleClick = async () => {
    if (!profile) return;
    let payload;
    setLoading(true);
    try {
      if (profile.following) {
        payload = await unfollowProfile(profile.username);
      } else {
        payload = await followProfile(profile.username);
      }
      setProfile(payload.data.profile);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const isUser = profile && user && profile.username === user.username;

  return (
    profile && (
      <View UNSAFE_style={{}}>
        <View
          paddingTop='size-300'
          paddingBottom='size-200'
          backgroundColor='gray-200'
          // UNSAFE_style={{
          //   backgroundColor: 'beige',
          // }}
        >
          <View
            UNSAFE_style={{
              width: `70%`,
              margin: `0 auto`,
              // backgroundColor: 'beige',
            }}
          >
            <Grid justifyContent='center'>
              <View
                UNSAFE_style={{
                  textAlign: 'center',
                }}
              >
                <Image
                  src={profile.image || ALT_IMAGE_URL}
                  alt={profile.username}
                  width='size-1200'
                  UNSAFE_style={{
                    borderRadius: '50%',
                  }}
                />
                <Heading level={3} marginTop='size-100'>
                  {profile.username}
                </Heading>
                <p>{profile.bio}</p>
              </View>
            </Grid>
            <Flex justifyContent='end'>
              <View>
                {isUser ? (
                  <EditProfileSettings />
                ) : (
                  <FollowUserButton
                    profile={profile}
                    onClick={handleClick}
                    loading={loading}
                  />
                )}
              </View>
            </Flex>
          </View>
        </View>

        <View
          marginTop='size-200'
          UNSAFE_style={{
            width: `70%`,
            margin: `0 auto`,
            // backgroundColor: 'beige',
          }}
        >
          <ProfileArticles username={username} />
        </View>
      </View>
    )
  );
}

function EditProfileSettings() {
  return (
    <Link
      to='/settings'
      className='btn btn-sm btn-outline-secondary action-btn'
    >
      <i className='ion-gear-a' /> Edit Profile Settings
    </Link>
  );
}
